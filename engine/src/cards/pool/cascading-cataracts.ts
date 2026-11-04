import { defineCard } from "../define.js";

// 126 splits of five mana over five colours are too many to list: all of one
// colour each, and one offer whose split the player picks (`manaSplit`).

const FIVE_TEXT = "{5}, {T}: Add five mana in any combination of colors.";

export default defineCard({
  name: "Cascading Cataracts",
  colors: [],
  types: ["land"],
  keywords: ["indestructible"],
  text: `Indestructible\n{T}: Add {C}.\n${FIVE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"] }, amount: 5 },
      resolve: null,
      text: FIVE_TEXT,
    },
  ],
});
