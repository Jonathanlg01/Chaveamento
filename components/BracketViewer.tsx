"use client";

import { useState, useEffect } from "react";
import type { BracketRound, Match } from "@/lib/bracketLogic";

const getRoundLabel = (roundIndex: number, totalRounds: number) => {
  const distanceToFinal = totalRounds - roundIndex;
  if (distanceToFinal === 1) return "Final";
  if (distanceToFinal === 2) return "Semifinal";
  if (distanceToFinal === 3) return "Quartas";
  if (distanceToFinal === 4) return "Oitavas";
  if (distanceToFinal === 5) return "16 Avos";
  return `Rodada ${roundIndex + 1}`;
};

interface BracketViewerProps {
  rounds: BracketRound[];
  onSelectWinner: (
    roundIndex: number,
    matchIndex: number,
    winner: string,
    score1?: number,
    score2?: number,
    player1Name?: string,
    player2Name?: string
  ) => void;
  onShowToast: (message: string, type: "success" | "warning") => void;
}

export function BracketViewer({ rounds, onSelectWinner, onShowToast }: BracketViewerProps) {
  const [selectedMatch, setSelectedMatch] = useState<{
    roundIndex: number;
    matchIndex: number;
    match: Match;
  } | null>(null);

  const [modalData, setModalData] = useState({
    player1: "",
    player2: "",
    score1: "",
    score2: "",
  });

  // Atualiza os dados do modal quando uma partida é selecionada
  useEffect(() => {
    if (selectedMatch) {
      setModalData({
        player1: selectedMatch.match.player1,
        player2: selectedMatch.match.player2,
        score1: selectedMatch.match.score1?.toString() || "",
        score2: selectedMatch.match.score2?.toString() || "",
      });
    }
  }, [selectedMatch]);

  const handleSaveMatch = () => {
    if (!selectedMatch) return;

    const s1 = parseInt(modalData.score1);
    const s2 = parseInt(modalData.score2);

    // Determina o vencedor baseado no placar
    if (!isNaN(s1) && !isNaN(s2)) {
      let winner = "";
      if (s1 > s2) winner = modalData.player1;
      else if (s2 > s1) winner = modalData.player2;
      else {
        onShowToast("Empates não são permitidos em chaves eliminatórias. Defina um vencedor pelo placar.", "warning");
        return;
      }
      
      onSelectWinner(
        selectedMatch.roundIndex, 
        selectedMatch.matchIndex, 
        winner, 
        s1, 
        s2,
        selectedMatch.roundIndex === 0 ? modalData.player1 : undefined,
        selectedMatch.roundIndex === 0 ? modalData.player2 : undefined
      );
      
      onShowToast("Resultado salvo com sucesso!", "success");
    }

    setSelectedMatch(null);
  };

  return (
    <div className="relative">
      <div className="custom-scrollbar flex min-h-[600px] gap-8 overflow-x-auto pb-12 pt-4 px-4">
        {rounds.map((round, roundIndex) => (
          <div key={`round-${roundIndex}`} className="flex flex-col">
            {round.map((match, matchIndex) => {
              const player1Selected = match.winner === match.player1 && match.winner !== null;
              const player2Selected = match.winner === match.player2 && match.winner !== null;
              const roundLabel = getRoundLabel(roundIndex, rounds.length);
              
              const matchHeight = 110 * Math.pow(2, roundIndex);
              const lineHeight = matchHeight / 2;

              return (
                <div 
                  key={match.id}
                  className="relative flex items-center justify-center w-64"
                  style={{ height: `${matchHeight}px` }}
                >
                  <div className="w-full relative z-10">
                    <div className="mb-1.5 ml-1 flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                      {roundLabel === "Final" && (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19,2H5C3.89,2 3,2.89 3,4V6C3,8.21 4.79,10 7,10C7.54,10 8.04,9.88 8.5,9.66C9.33,11.53 11,13.2 11,13.8V19H7V21H17V19H13V13.8C13,13.2 14.67,11.53 15.5,9.66C15.96,9.88 16.46,10 17,10C19.21,10 21,8.21 21,6V4C21,2.89 20.11,2 19,2M7,8C5.9,8 5,7.1 5,6V4H7V8M19,6C19,7.1 18.1,8 17,8V4H19V6Z" /></svg>
                      )}
                      {roundLabel} - Jogo {matchIndex + 1}
                    </div>

                    <button 
                      onClick={() => setSelectedMatch({ roundIndex, matchIndex, match })}
                      className="w-full relative flex shadow-md rounded-xl overflow-hidden bg-white ring-1 ring-slate-200 hover:ring-sky-400 hover:shadow-sky-100 transition-all text-left"
                    >
                      <div className="flex-1 flex flex-col">
                        <div className={`w-full px-3 py-2.5 text-sm font-medium border-b border-slate-100 flex justify-between items-center ${
                          player1Selected ? 'bg-orange-100/60 text-slate-900' : 'bg-slate-100/60 text-slate-700'
                        }`}>
                          <span className="truncate">{match.player1 || <span className="italic text-slate-400">TBD</span>}</span>
                          {match.player1 === "BYE" && <span className="ml-2 rounded bg-slate-200/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">BYE</span>}
                        </div>

                        <div className={`w-full px-3 py-2.5 text-sm font-medium flex justify-between items-center ${
                          player2Selected ? 'bg-orange-100/60 text-slate-900' : 'bg-slate-100/60 text-slate-700'
                        }`}>
                          <span className="truncate">{match.player2 || <span className="italic text-slate-400">TBD</span>}</span>
                          {match.player2 === "BYE" && <span className="ml-2 rounded bg-slate-200/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">BYE</span>}
                        </div>
                      </div>

                      <div className="w-10 bg-slate-950 flex flex-col text-white font-bold text-sm">
                        <div className="flex-1 flex items-center justify-center border-b border-slate-800">
                          {match.score1 !== undefined ? match.score1 : '-'}
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          {match.score2 !== undefined ? match.score2 : '-'}
                        </div>
                      </div>

                      <div className="absolute top-1/2 left-[calc(100%-2.5rem)] -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm text-[8px] font-black text-slate-300 ring-1 ring-slate-100 z-10">
                        VS
                      </div>
                    </button>
                  </div>

                  {roundIndex < rounds.length - 1 && matchIndex % 2 === 0 && (
                    <div 
                      className="absolute left-full top-1/2 w-4 border-t-2 border-r-2 border-slate-300 rounded-tr-xl"
                      style={{ height: `${lineHeight}px` }}
                    />
                  )}
                  {roundIndex < rounds.length - 1 && matchIndex % 2 === 1 && (
                    <div 
                      className="absolute left-full bottom-1/2 w-4 border-b-2 border-r-2 border-slate-300 rounded-br-xl"
                      style={{ height: `${lineHeight}px` }}
                    />
                  )}
                  {roundIndex > 0 && (
                    <div className="absolute right-full top-1/2 w-4 border-t-2 border-slate-300" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Match Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-slate-200 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-sky-400">Editar Partida</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {getRoundLabel(selectedMatch.roundIndex, rounds.length)} - Jogo {selectedMatch.matchIndex + 1}
                  </p>
                </div>
                <button onClick={() => setSelectedMatch(null)} className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                {/* Player 1 Row */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Participante 1</label>
                    <input 
                      type="text"
                      disabled={selectedMatch.roundIndex > 0 || selectedMatch.match.player1 === "BYE"}
                      value={modalData.player1}
                      onChange={e => setModalData({...modalData, player1: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-sky-500 transition-all disabled:opacity-60"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-center">Placar</label>
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={modalData.score1}
                      onChange={e => setModalData({...modalData, score1: e.target.value.replace(/\D/g, '')})}
                      className="w-full bg-slate-900 border-2 border-slate-900 rounded-xl px-2 py-3 text-center text-lg font-black text-white outline-none focus:ring-4 focus:ring-sky-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <span className="text-xs font-black text-slate-300 italic">VS</span>
                </div>

                {/* Player 2 Row */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Participante 2</label>
                    <input 
                      type="text"
                      disabled={selectedMatch.roundIndex > 0 || selectedMatch.match.player2 === "BYE"}
                      value={modalData.player2}
                      onChange={e => setModalData({...modalData, player2: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-sky-500 transition-all disabled:opacity-60"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-center">Placar</label>
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={modalData.score2}
                      onChange={e => setModalData({...modalData, score2: e.target.value.replace(/\D/g, '')})}
                      className="w-full bg-slate-900 border-2 border-slate-900 rounded-xl px-2 py-3 text-center text-lg font-black text-white outline-none focus:ring-4 focus:ring-sky-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setSelectedMatch(null)}
                  className="flex-1 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveMatch}
                  className="flex-[2] bg-sky-500 hover:bg-sky-600 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Salvar Resultado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
