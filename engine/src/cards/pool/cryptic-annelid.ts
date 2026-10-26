import { defineCard } from "../define.js";

// The ruling: the three scries happen in sequence, in the order printed.
export default defineCard({
  name: "Cryptic Annelid",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Worm", "Beast"],
  power: 1,
  toughness: 4,
  text: "When this creature enters, scry 1, then scry 2, then scry 3. (To scry X, look at the top X cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          { kind: "scry", amount: 2 },
          { kind: "scry", amount: 3 },
        ],
      },
      resolve: null,
      text: "When this creature enters, scry 1, then scry 2, then scry 3.",
    },
  ],
});
