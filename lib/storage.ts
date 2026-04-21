import { BracketRound } from "./bracketLogic";

export type Tournament = {
  id: string;
  title: string;
  size: number;
  createdAt: number;
  rounds: BracketRound[];
  participants: string[];
};

export const getTournaments = (): Tournament[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("tournaments");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getTournament = (id: string): Tournament | undefined => {
  return getTournaments().find((t) => t.id === id);
};

export const saveTournament = (tournament: Tournament) => {
  if (typeof window === "undefined") return;
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournament.id);
  
  if (index >= 0) {
    tournaments[index] = tournament;
  } else {
    tournaments.push(tournament);
  }
  
  localStorage.setItem("tournaments", JSON.stringify(tournaments));
};

export const deleteTournament = (id: string) => {
  if (typeof window === "undefined") return;
  const tournaments = getTournaments().filter((t) => t.id !== id);
  localStorage.setItem("tournaments", JSON.stringify(tournaments));
};
