import { defineCard } from "../define.js";

// Rulings:
//   [2017-07-14] Avid Reclaimer's ability is a mana ability. It doesn't use the stack and can't be
//     responded to. You'll immediately add mana and gain 2 life, if applicable.
// Black Tom Cassidy's shape: the life is the mana ability's `also`.

export default defineCard({
  name: "Avid Reclaimer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: "{T}: Add {G} or {U}. If you control a Nissa planeswalker, you gain 2 life.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["G", "U"] },
        amount: 1,
        also: {
          kind: "conditional",
          condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Nissa" }, atLeast: 1 },
          then: { kind: "gain-life", amount: 2 },
        },
      },
      resolve: null,
      text: "{T}: Add {G} or {U}. If you control a Nissa planeswalker, you gain 2 life.",
    },
  ],
});
