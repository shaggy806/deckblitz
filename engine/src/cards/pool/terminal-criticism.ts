import { defineCard } from "../define.js";

// EDHREC rank 29683.
export default defineCard({
  name: "Terminal Criticism",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature or planeswalker that's blue or red. You gain 1 life.",
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: { typesAnyOf: ["creature", "planeswalker"], anyOf: [{ colors: ["U"] }, { colors: ["R"] }] },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: 1 },
    ],
  },
});
