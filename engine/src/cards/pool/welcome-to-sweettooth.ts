import { defineCard } from "../define.js";

// EDHREC rank 8070.
//
// Rulings:
//   [2024-11-08] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token.

const I_TEXT = "I — Create a 1/1 white Human creature token.";
const II_TEXT = "II — Create a Food token.";
const III_TEXT =
  "III — Put X +1/+1 counters on target creature you control, where X is one plus the number of Foods you control.";

export default defineCard({
  name: "Welcome to Sweettooth",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Human Token", count: 1 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: ["creature-you-control"],
      effect: {
        kind: "add-counter",
        target: 0,
        counter: "+1/+1",
        amount: { sum: [1, { countOf: { type: "artifact", subtype: "Food", controlledBy: "you" } }] },
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
