import { OpeningScene } from "@/sections/OpeningScene";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col">
      <OpeningScene />
      {/* Next milestones: RSVP, event details, gallery, and other
          sections mount below once the invitation has opened. */}
    </main>
  );
}
