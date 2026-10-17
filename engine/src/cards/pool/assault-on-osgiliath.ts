import { defineCard } from "../define.js";

// EDHREC rank 8061.
// Makes Orc Army by amassing → the engine's "Army Token".
//
// Rulings:
//   [2023-06-16] If you choose a value of 0 for X while you control a non-Orc Army, you won't put
//     any counters on it, but it will become an Orc in addition to its other types.
//   [2023-06-16] If you choose a value of 0 for X while you don't control an Army, you will create
//     a 0/0 Orc Army creature token and won't put any counters on it. In most cases, that 0/0
//     token will die immediately.

const GOBLINS_AND_ORCS = { subtypes: ["Goblin", "Orc"], controlledBy: "you" } as const;

export default defineCard({
  name: "Assault on Osgiliath",
  manaCost: "{X}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Amass Orcs X, then Goblins and Orcs you control gain double strike and haste until end of turn. (To amass Orcs X, put X +1/+1 counters on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "amass", amount: "x", creatureType: "Orc" },
      { kind: "grant-keyword-all", filter: GOBLINS_AND_ORCS, keyword: "double-strike", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: GOBLINS_AND_ORCS, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
