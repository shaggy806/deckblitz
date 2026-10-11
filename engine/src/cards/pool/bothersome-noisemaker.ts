import { defineCard } from "../define.js";

// EDHREC rank 10270.
// Makes Goblin Army by amassing → the engine's "Army Token" (amass adds Goblin).
//
// Rulings:
//   [2026-06-29] In the rare case that you control multiple Army creatures (perhaps because you
//     control a creature with changeling) while you amass Goblins, you choose which of your Army
//     creatures to put the +1/+1 counters on. If that creature isn't a Goblin, it becomes a Goblin
//     in addition to its other types.
//   [2026-06-29] If you don't control an Army, the Goblin Army token you create enters the
//     battlefield as a 0/0 creature before receiving counters.

const TEXT =
  "Whenever you cast a noncreature spell, amass Goblins 1. (Put a +1/+1 counter on an Army you control. It's also a Goblin. If you don't control an Army, create a 0/0 black Goblin Army creature token first.)";

export default defineCard({
  name: "Bothersome Noisemaker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Bard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "amass", amount: 1, creatureType: "Goblin" },
      resolve: null,
      text: "Whenever you cast a noncreature spell, amass Goblins 1.",
    },
  ],
});
