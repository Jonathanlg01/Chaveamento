export type Match = {
  id: string;
  player1: string;
  player2: string;
  score1?: number;
  score2?: number;
  winner: string | null;
  round: number;
  nextMatchIndex?: number;
  nextSlot?: 1 | 2;
};

export type BracketRound = Match[];

const normalizeParticipants = (participants: string[]) =>
  participants
    .map((participant) => participant.trim())
    .filter(Boolean);

const nextPowerOfTwo = (value: number) => {
  let power = 1;
  while (power < value) {
    power *= 2;
  }
  return power;
};

// Gera a ordem correta de cabeças de chave (seeding) para torneios
const getSeedingMap = (size: number): number[] => {
  if (size < 2) return [];
  let currentLayer = [1, 2];
  const rounds = Math.log2(size);
  for (let r = 1; r < rounds; r++) {
    const nextLayer: number[] = [];
    const sum = currentLayer.length * 2 + 1;
    for (let i = 0; i < currentLayer.length; i++) {
      nextLayer.push(currentLayer[i]);
      nextLayer.push(sum - currentLayer[i]);
    }
    currentLayer = nextLayer;
  }
  return currentLayer;
};

const cloneRounds = (rounds: BracketRound[]) =>
  rounds.map((round) => round.map((match) => ({ ...match })));

const applyByeWinners = (rounds: BracketRound[]) => {
  const updated = cloneRounds(rounds);

  for (let roundIndex = 0; roundIndex < updated.length - 1; roundIndex += 1) {
    const currentRound = updated[roundIndex];
    const nextRound = updated[roundIndex + 1];

    currentRound.forEach((match) => {
      if (!match.winner && match.player1 && match.player2) {
        if (match.player1 === "BYE" && match.player2 !== "BYE") {
          match.winner = match.player2;
          match.score1 = 0;
          match.score2 = 1; // Representação simbólica para BYE
        } else if (match.player2 === "BYE" && match.player1 !== "BYE") {
          match.winner = match.player1;
          match.score1 = 1;
          match.score2 = 0;
        }
      }

      if (match.winner && match.nextMatchIndex !== undefined) {
        const nextMatch = nextRound[match.nextMatchIndex];
        if (match.nextSlot === 1) {
          nextMatch.player1 = match.winner;
        } else {
          nextMatch.player2 = match.winner;
        }
      }
    });
  }

  return updated;
};

export const buildBracket = (participants: string[]): BracketRound[] => {
  const normalized = normalizeParticipants(participants);
  if (normalized.length < 2) {
    return [];
  }

  const bracketSize = nextPowerOfTwo(normalized.length);
  const seedingMap = getSeedingMap(bracketSize);

  // Mapeia os participantes seguindo a lógica de cabeças de chave
  const paddedParticipants: string[] = [];
  for (let i = 0; i < bracketSize; i++) {
    const seed = seedingMap[i];
    if (seed <= normalized.length) {
      paddedParticipants.push(normalized[seed - 1]);
    } else {
      paddedParticipants.push("BYE");
    }
  }

  const rounds: BracketRound[] = [];

  const firstRound: BracketRound = Array.from(
    { length: bracketSize / 2 },
    (_, index) => {
      const player1 = paddedParticipants[index * 2];
      const player2 = paddedParticipants[index * 2 + 1];

      return {
        id: `r1-m${index + 1}`,
        player1,
        player2,
        winner: null,
        round: 1,
        nextMatchIndex: Math.floor(index / 2),
        nextSlot: index % 2 === 0 ? 1 : 2,
      };
    }
  );

  rounds.push(firstRound);

  let previousRound = firstRound;
  const totalRounds = Math.log2(bracketSize);

  for (let round = 2; round <= totalRounds; round += 1) {
    const currentRound: BracketRound = Array.from(
      { length: previousRound.length / 2 },
      (_, matchIndex) => ({
        id: `r${round}-m${matchIndex + 1}`,
        player1: "",
        player2: "",
        winner: null,
        round,
        nextMatchIndex: Math.floor(matchIndex / 2),
        nextSlot: matchIndex % 2 === 0 ? 1 : 2,
      })
    );

    rounds.push(currentRound);
    previousRound = currentRound;
  }

  return applyByeWinners(rounds);
};

export const advanceWinner = (
  rounds: BracketRound[],
  roundIndex: number,
  matchIndex: number,
  winner: string,
  score1?: number,
  score2?: number,
  player1Name?: string,
  player2Name?: string
): BracketRound[] => {
  const updated = cloneRounds(rounds);
  const match = updated[roundIndex][matchIndex];
  
  if (player1Name !== undefined) match.player1 = player1Name;
  if (player2Name !== undefined) match.player2 = player2Name;
  
  match.winner = winner;
  match.score1 = score1;
  match.score2 = score2;

  // Reprocessa os avanços de todos os rounds para manter integridade
  for (let r = 0; r < updated.length - 1; r += 1) {
    const currentRound = updated[r];
    const nextRound = updated[r + 1];

    currentRound.forEach((m) => {
      if (m.winner && m.nextMatchIndex !== undefined) {
        const nextMatch = nextRound[m.nextMatchIndex];
        const currentPlayerInSlot = m.nextSlot === 1 ? nextMatch.player1 : nextMatch.player2;
        
        // Se o vencedor atual do match (m) for diferente do que está no slot do próximo match
        if (currentPlayerInSlot !== m.winner) {
          if (m.nextSlot === 1) {
            nextMatch.player1 = m.winner;
          } else {
            nextMatch.player2 = m.winner;
          }
          
          // Como o participante mudou, o resultado anterior daquela partida futura é invalidado
          nextMatch.winner = null;
          nextMatch.score1 = undefined;
          nextMatch.score2 = undefined;
        }
      }
    });

    // Reaplica BYEs se necessário no round seguinte
    nextRound.forEach((m) => {
      if (!m.winner && m.player1 && m.player2) {
        if (m.player1 === "BYE" && m.player2 !== "BYE") {
          m.winner = m.player2;
          m.score1 = 0;
          m.score2 = 1;
        } else if (m.player2 === "BYE" && m.player1 !== "BYE") {
          m.winner = m.player1;
          m.score1 = 1;
          m.score2 = 0;
        }
      }
    });
  }

  return updated;
};
