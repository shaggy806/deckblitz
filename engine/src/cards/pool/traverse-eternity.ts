import { defineCard } from "../define.js";

// Rulings:
//   [2023-10-13] If a historic permanent has an {X} in its mana cost, the value of {X} is 0 when
//     determining the mana value of that permanent.
//
// Historic is artifacts, legendaries and Sagas (rule 700.6). The greatest mana value is read as
// the spell resolves; with no historic permanent it's 0.

export default defineCard({
  name: "Traverse Eternity",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw cards equal to the greatest mana value among historic permanents you control. (Artifacts, legendaries, and Sagas are historic.)",
  targets: [],
  effect: {
    kind: "draw",
    amount: {
      aggregate: "max",
      of: "mana-value",
      filter: {
        controlledBy: "you",
        anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }],
      },
    },
  },
});
