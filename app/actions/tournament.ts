"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export async function getTournamentsAction() {
  try {
    const session = await getSession();
    if (!session?.userId) return [];

    const tournaments = await prisma.tournament.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });
    
    return tournaments.map((t) => ({
      id: t.id,
      title: t.title,
      size: t.size,
      rounds: JSON.parse(t.rounds),
      participants: JSON.parse(t.participants),
      createdAt: t.createdAt.getTime(),
    }));
  } catch (error) {
    console.error("Erro ao buscar torneios:", error);
    return [];
  }
}

export async function getTournamentByIdAction(id: string) {
  try {
    const session = await getSession();
    if (!session?.userId) return null;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
    });
    
    if (!tournament || tournament.userId !== session.userId) return null;
    
    return {
      id: tournament.id,
      title: tournament.title,
      size: tournament.size,
      rounds: JSON.parse(tournament.rounds),
      participants: JSON.parse(tournament.participants),
      createdAt: tournament.createdAt.getTime(),
    };
  } catch (error) {
    console.error(`Erro ao buscar torneio ${id}:`, error);
    return null;
  }
}

export async function saveTournamentAction(data: {
  id: string;
  title: string;
  size: number;
  rounds: any;
  participants: string[];
}) {
  try {
    const session = await getSession();
    if (!session?.userId) throw new Error("Não autorizado");

    const existing = await prisma.tournament.findUnique({
      where: { id: data.id }
    });

    if (existing && existing.userId !== session.userId) {
      throw new Error("Não autorizado");
    }

    await prisma.tournament.upsert({
      where: { id: data.id },
      update: {
        title: data.title,
        size: data.size,
        rounds: JSON.stringify(data.rounds),
        participants: JSON.stringify(data.participants),
      },
      create: {
        id: data.id,
        title: data.title,
        size: data.size,
        rounds: JSON.stringify(data.rounds),
        participants: JSON.stringify(data.participants),
        userId: session.userId,
      },
    });
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar torneio:", error);
    return { success: false, error };
  }
}

export async function deleteTournamentAction(id: string) {
  try {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Não autorizado" };

    const tournament = await prisma.tournament.findUnique({
      where: { id }
    });

    if (!tournament || tournament.userId !== session.userId) {
      return { success: false, error: "Não autorizado" };
    }

    await prisma.tournament.delete({
      where: { id },
    });
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(`Erro ao deletar torneio ${id}:`, error);
    return { success: false, error };
  }
}
