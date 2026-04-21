"use client";

import { useState, useEffect } from "react";
import { getTournamentsAction, deleteTournamentAction } from "@/app/actions/tournament";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Interface para o torneio retornado pela Action
type TournamentInfo = {
  id: string;
  title: string;
  size: number;
  createdAt: number;
};

export default function Dashboard() {
  const [tournaments, setTournaments] = useState<TournamentInfo[]>([]);
  const router = useRouter();

  const loadTournaments = async () => {
    const data = await getTournamentsAction();
    setTournaments(data);
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (confirm("Tem certeza que deseja excluir este campeonato?")) {
      await deleteTournamentAction(id);
      loadTournaments();
    }
  };

  const createNewTournament = () => {
    const id = crypto.randomUUID();
    router.push(`/dashboard/tournament/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-sky-500/30">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[800px] w-[800px] rounded-full bg-sky-900/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[800px] w-[800px] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-12">
        <header className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              Meus <span className="text-sky-400">Campeonatos</span>
            </h1>
            <p className="mt-2 text-slate-400 font-medium">Gerencie suas chaves e acompanhe os resultados</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={createNewTournament}
              className="flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 hover:bg-sky-400 hover:shadow-sky-500/40 active:translate-y-0"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Novo Campeonato
            </button>
            <Link 
              href="/"
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </Link>
          </div>
        </header>

        {tournaments.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 ring-4 ring-slate-900">
              <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Nenhum campeonato ainda</h2>
            <p className="mt-2 max-w-md text-slate-400">
              Você ainda não criou nenhum chaveamento. Clique no botão acima para começar o seu primeiro torneio.
            </p>
            <button 
              onClick={createNewTournament}
              className="mt-8 text-sky-400 font-bold hover:text-sky-300 transition-colors"
            >
              Criar meu primeiro torneio &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Link 
                href={`/dashboard/tournament/${tournament.id}`} 
                key={tournament.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl hover:shadow-sky-500/10 hover:border-sky-500/30"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/20 to-indigo-500/20 text-sky-400 ring-1 ring-sky-400/30">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, tournament.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors bg-white/5 rounded-full hover:bg-red-400/10 opacity-0 group-hover:opacity-100"
                      title="Excluir"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-white truncate pr-4">
                    {tournament.title || "Campeonato Sem Nome"}
                  </h3>
                  <div className="mt-4 flex gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-400 ring-1 ring-sky-500/20">
                      {tournament.size} Jogadores
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-300 ring-1 ring-white/10">
                      {new Date(tournament.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
