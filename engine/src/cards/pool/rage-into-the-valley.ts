import { defineCard } from "../define.js";

// EDHREC rank 13448. Amass Goblins 2 is Bothersome Noisemaker's `amass`
// (rule 701.47): a 0/0 Goblin Army first if you control no Army, the choice
// of Army yours if you control several.

export default defineCard({
  name: "Rage into the Valley",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "You draw a card and lose 1 life.\n" +
    "Amass Goblins 2. (Put two +1/+1 counters on an Army you control. It's also a Goblin. If you don't control an Army, create a 0/0 black Goblin Army creature token first.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      { kind: "lose-life", amount: 1 },
      { kind: "amass", amount: 2, creatureType: "Goblin" },
    ],
  },
});
