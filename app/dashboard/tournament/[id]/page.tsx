import { BracketBuilder } from "@/components/BracketBuilder";

export default function TournamentPage({ params }: { params: { id: string } }) {
  return <BracketBuilder tournamentId={params.id} />;
}
