import { defineCard } from "../define.js";

// EDHREC rank 13962.
// Makes Goblin Army by amassing → the engine's "Army Token".
//
// Rulings:
//   [2026-06-29] To amass Goblins N, if you don't control an Army creature, create a 0/0 black
//     Goblin Army creature token. Then you choose an Army creature you control and put N +1/+1
//     counters on it. If that Army isn't already a Goblin, it becomes a Goblin in addition to its
//     other types.

const TEXT =
  "When this creature dies, amass Goblins 4. (Put four +1/+1 counters on an Army you control. It's also a Goblin. If you don't control an Army, create a 0/0 black Goblin Army creature token first.)";

export default defineCard({
  name: "Fearsome Goblin Pair",
  manaCost: "{2}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Goblin", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "amass", amount: 4, creatureType: "Goblin" },
      resolve: null,
      text: "When this creature dies, amass Goblins 4.",
    },
  ],
});
