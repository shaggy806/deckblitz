import { defineCard } from "../define.js";

// EDHREC rank 7234.
// Makes Human Soldier → use "Human Soldier Token"; Human Knight → "Human Knight Token".
//
// Rulings:
//   [2023-06-16] When Oath of Eorl's final chapter ability triggers, you can choose not to target
//     a Human just to become the monarch. However, if you do choose a target, and that target is
//     illegal at the time the ability tries to resolve, the ability won't resolve and none of its
//     effects will happen. You won't become the monarch.

const I_TEXT = "I — Create two 1/1 white Human Soldier creature tokens.";
const II_TEXT = "II — Create two 2/2 red Human Knight creature tokens with trample and haste.";
const III_TEXT = "III — Put an indestructible counter on up to one target Human. You become the monarch.";

export default defineCard({
  name: "Oath of Eorl",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 2 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Human Knight Token", count: 2 },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { subtype: "Human" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "indestructible", amount: 1 },
          { kind: "become-monarch" },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
