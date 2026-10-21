import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 8428.
//
// The draw and the amass are one resolution (its ruling): X is the hand
// counted as the amass happens, after the two cards are drawn. Can't be
// countered (rule 701.5f) — a counterspell's other effects still happen.

export default defineCard({
  name: "Commence the Endgame",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nDraw two cards, then amass Zombies X, where X is the number of cards in your hand. (Put X +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "amass", amount: { cardsInHand: "you" }, creatureType: "Zombie" },
    ],
  },
});
