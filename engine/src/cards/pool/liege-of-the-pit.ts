import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 16903. Lord of the Pit's upkeep, with morph.
//
// Rulings:
//   [2006-09-25] If you have another creature on the battlefield when the ability resolves, you
//     must sacrifice it. You can’t choose to be dealt 7 damage instead.
//   [2006-09-25] You can’t sacrifice Liege of the Pit to its own ability. You can sacrifice one
//     Liege of the Pit to another Liege of the Pit.

const UPKEEP =
  "At the beginning of your upkeep, sacrifice a creature other than this creature. If you can't, this creature deals 7 damage to you.";

export default defineCard({
  name: "Liege of the Pit",
  manaCost: "{5}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "trample"],
  morph: { keyword: "morph", cost: "{B}{B}{B}{B}" },
  text: `Flying, trample\n${UPKEEP}\nMorph {B}{B}{B}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1, exceptSource: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atMost: 0 },
            then: { kind: "damage", amount: 7, who: "you" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
