"use client";

import { useState, useRef, useEffect } from "react";
import { buildBracket, advanceWinner, type BracketRound } from "@/lib/bracketLogic";
import { BracketViewer } from "@/components/BracketViewer";
import { getTournamentByIdAction, saveTournamentAction } from "@/app/actions/tournament";
import Link from "next/link";

export function BracketBuilder({ tournamentId }: { tournamentId: string }) {
  const [rounds, setRounds] = useState<BracketRound[]>([]);
  const [championshipTitle, setChampionshipTitle] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Estados para o Toast
  const [toastData, setToastData] = useState<{ message: string; type: "success" | "warning" } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Carrega os dados iniciais do banco
  useEffect(() => {
    async function loadData() {
      const data = await getTournamentByIdAction(tournamentId);
      if (data) {
        setChampionshipTitle(data.title);
        setRounds(data.rounds);
        setSelectedSize(data.size);
        setParticipants(data.participants);
      }
      setIsLoaded(true);
    }
    loadData();
  }, [tournamentId]);

  // Função interna para salvar
  const handleSaveToDatabase = async () => {
    if (!selectedSize && rounds.length === 0 && !championshipTitle) return;
    
    await saveTournamentAction({
      id: tournamentId,
      title: championshipTitle,
      size: selectedSize || rounds[0]?.length * 2 || 0,
      rounds,
      participants,
    });
  };

  // Salva automaticamente quando há mudanças
  useEffect(() => {
    if (!isLoaded) return;
    
    // Usamos debounce/timeout simples para evitar excesso de requisições
    const timer = setTimeout(() => {
      handleSaveToDatabase();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [rounds, championshipTitle, selectedSize, participants, isLoaded, tournamentId]);

  const showToast = (message: string, type: "success" | "warning" = "success") => {
    setToastData({ message, type });
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastData(null);
    }, 4000);
  };

  const bracketSizes = [
    { label: "Oitavas", value: 16 },
    { label: "Quartas", value: 8 },
    { label: "Semi", value: 4 },
    { label: "Final", value: 2 },
  ];

  const handleSelectSize = (size: number) => {
    setSelectedSize(size);
    const emptyParticipants = Array(size)
      .fill("")
      .map((_, i) => `Participante ${i + 1}`);
    setParticipants(emptyParticipants);
    setRounds(buildBracket(emptyParticipants));
    showToast(`Chaveamento para ${size} participantes criado!`, "success");
  };

  const handleCustomSize = () => {
    const val = parseInt(customSizeInput, 10);
    if (!isNaN(val) && val >= 2 && val % 2 === 0) {
      handleSelectSize(val);
    } else {
      showToast("Por favor, insira um número par (divisível por 2) maior ou igual a 2.", "warning");
    }
  };

  const handleWinnerSelect = (
    roundIndex: number,
    matchIndex: number,
    winner: string,
    score1?: number,
    score2?: number,
    player1Name?: string,
    player2Name?: string
  ) => {
    setRounds((currentRounds) =>
      advanceWinner(currentRounds, roundIndex, matchIndex, winner, score1, score2, player1Name, player2Name)
    );
  };

  if (!isLoaded) return null; // Evita piscar a tela vazia

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-950 selection:bg-sky-200">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[800px] w-[800px] rounded-full bg-sky-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[800px] w-[800px] rounded-full bg-indigo-100/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 rounded-3xl bg-white/80 p-8 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex flex-1 items-center gap-4 w-full">
              <Link 
                href="/dashboard"
                className="flex items-center justify-center shrink-0 rounded-xl bg-slate-100 p-3 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                title="Voltar ao Dashboard"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <input
                value={championshipTitle}
                onChange={(event) => setChampionshipTitle(event.target.value)}
                placeholder="Nome do Campeonato..."
                className="w-full bg-transparent text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:placeholder:text-slate-200"
              />
            </div>
            
            <button
              onClick={async () => {
                await handleSaveToDatabase();
                showToast("Campeonato salvo com sucesso!", "success");
              }}
              className="flex w-full sm:w-auto items-center justify-center gap-2 shrink-0 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 hover:bg-sky-400 hover:shadow-sky-500/40 active:translate-y-0"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Salvar Torneio
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Tamanho da Chave</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {bracketSizes.map((size) => {
                const isSelected = selectedSize === size.value;
                return (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => handleSelectSize(size.value)}
                    className={`group relative flex items-center justify-center overflow-hidden rounded-xl border-2 px-5 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 ${
                      isSelected
                        ? "border-sky-500 bg-sky-50 shadow-sm shadow-sky-500/20"
                        : "border-slate-100 bg-white shadow-sm hover:border-sky-200"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-indigo-400/10 opacity-100" />
                    )}
                    <span
                      className={`relative flex items-baseline gap-1.5 text-xl font-black tracking-tighter transition-colors duration-300 ${
                        isSelected
                          ? "text-sky-600"
                          : "text-slate-400 group-hover:text-sky-500"
                      }`}
                    >
                      {size.value}
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-sky-900' : 'text-slate-400'}`}>
                        {size.label}
                      </span>
                    </span>
                  </button>
                );
              })}

              {/* Opção Customizada */}
              <div className="flex items-stretch overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm transition-all focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/10">
                <input
                  type="number"
                  min="2"
                  step="2"
                  placeholder="Custom..."
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCustomSize();
                  }}
                  className="w-24 bg-transparent px-3 py-2 text-center text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleCustomSize}
                  className="border-l-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="w-full">
          <div className="overflow-hidden rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-200/40 ring-1 ring-slate-200/60 backdrop-blur-xl">
            {rounds.length > 0 ? (
              <BracketViewer 
                rounds={rounds} 
                onSelectWinner={handleWinnerSelect}
                onShowToast={showToast}
              />
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-700">Nenhum torneio criado</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Selecione o tamanho do campeonato acima para gerar o chaveamento.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Toast Notification */}
      <div 
        className={`fixed top-8 right-8 z-50 flex max-w-sm items-center gap-3 rounded-2xl bg-slate-900 p-4 px-5 text-sm font-medium text-white shadow-2xl transition-all duration-300 ease-out ${
          toastData ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800">
          {toastData?.type === "success" ? (
            <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        <p>{toastData?.message}</p>
        <button onClick={() => setToastData(null)} className="ml-auto p-1 text-slate-400 hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
