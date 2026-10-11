import { defineCard } from "../define.js";

// EDHREC rank 13853.
// Makes Goblin Army by amassing → the engine's "Army Token" (amass adds Goblin).
//
// Rulings:
//   [2026-06-29] To amass Goblins N, if you don't control an Army creature, create a 0/0 black
//     Goblin Army creature token. Then you choose an Army creature you control and put N +1/+1
//     counters on it. If that Army isn't already a Goblin, it becomes a Goblin in addition to its
//     other types.
const TEXT =
  "Whenever you attack, amass Goblins 2. (Put two +1/+1 counters on an Army you control. It's also a Goblin. If you don't control an Army, create a 0/0 black Goblin Army creature token first.)";

export default defineCard({
  name: "Misty Mountains Raider",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Soldier"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "amass", amount: 2, creatureType: "Goblin" },
      resolve: null,
      text: "Whenever you attack, amass Goblins 2.",
    },
  ],
});
