import { BracketBuilder } from "@/components/BracketBuilder";

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <BracketBuilder tournamentId={resolvedParams.id} />;
}
