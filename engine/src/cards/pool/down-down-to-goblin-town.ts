import { defineCard } from "../define.js";

// EDHREC rank 17334.
// Makes Goblin Army by amassing → the engine's "Army Token".
//
// Rulings:
//   [2026-06-29] In the rare case that you control multiple Army creatures (perhaps because you
//     control a creature with changeling) while you amass Goblins, you choose which of your Army
//     creatures to put the +1/+1 counters on. If that creature isn't a Goblin, it becomes a Goblin
//     in addition to its other types.
//   [2026-06-29] Some cards refer to the "amassed Army." That means the Army creature you chose to
//     receive counters, even if no counters were placed on it for some reason.
//   [2026-06-29] If you don't control an Army, the Goblin Army token you create enters the
//     battlefield as a 0/0 creature before receiving counters. Any abilities that trigger when a
//     creature with a certain power enters the battlefield, such as that of Mentor of the Meek,
//     will see the token enter as a 0/0 creature before it gets +1/+1 counters.
//   [2026-06-29] To amass Goblins N, if you don't control an Army creature, create a 0/0 black
//     Goblin Army creature token. Then you choose an Army creature you control and put N +1/+1
//     counters on it. If that Army isn't already a Goblin, it becomes a Goblin in addition to its
//     other types.
//   [2026-06-29] Some spells and abilities that amass Goblins may require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won't resolve. You
//     won't amass Goblins.
//   [2026-06-29] Amass Orcs works the same way, except you create a 0/0 black Orc Army creature
//     token if you don't control an Army. And if the Army creature you chose isn't already an Orc,
//     it becomes an Orc in addition to its other types. By combining cards with amass Orcs and
//     amass Goblins, you can end up with a Goblin Orc Army.

export default defineCard({
  name: "Down, Down to Goblin-town",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\nI — Target opponent reveals their hand. You choose a nonland card from it. That player discards that card.\nII — Amass Goblins 1. (Put a +1/+1 counter on an Army you control. It's also a Goblin. If you don't control an Army, create a 0/0 black Goblin Army creature token first.)\nIII, IV — Target opponent loses 1 life and you gain 1 life.",
  chapters: [
    {
      at: [1],
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      resolve: null,
      text: "I — Target opponent reveals their hand. You choose a nonland card from it. That player discards that card.",
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "amass", amount: 1, creatureType: "Goblin" },
      resolve: null,
      text: "II — Amass Goblins 1.",
    },
    {
      at: [3, 4],
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "III, IV — Target opponent loses 1 life and you gain 1 life.",
    },
  ],
});
