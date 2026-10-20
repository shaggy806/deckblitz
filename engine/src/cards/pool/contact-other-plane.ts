import { defineCard } from "../define.js";

// EDHREC rank 8555. A results table (rule 706.3a).
export default defineCard({
  name: "Contact Other Plane",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Roll a d20.\n1—9 | Draw two cards.\n10—19 | Scry 2, then draw two cards.\n20 | Scry 3, then draw three cards.",
  targets: [],
  effect: {
    kind: "roll-dice",
    sides: 20,
    table: [
      { min: 1, max: 9, effect: { kind: "draw", amount: 2 } },
      { min: 10, max: 19, effect: { kind: "scry", amount: 2, then: { kind: "draw", amount: 2 } } },
      { min: 20, effect: { kind: "scry", amount: 3, then: { kind: "draw", amount: 3 } } },
    ],
  },
});
