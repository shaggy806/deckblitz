import { defineCard } from "../define.js";

// EDHREC rank 12728.
//
// Rulings:
//   [2023-02-04] As the enters-the battlefield ability resolves, first you scry 2. Then each
//     opponent in turn order chooses whether or not to scry 1. Those who do (likely all of them)
//     look at the top card of their library at the same time, then they decide in turn order where
//     their card goes. Each opponent will know the choices of previous players in turn order
//     before making their own choices.

// "Each opponent may scry 1" is Model of Unity's `each-player-may`: each
// opponent in turn order, their own scry.
const ENTERS_TEXT = "When this creature enters, scry 2. Then each opponent may scry 1.";

export default defineCard({
  name: "Myr Custodian",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Myr"],
  power: 2,
  toughness: 3,
  text: `${ENTERS_TEXT} (To scry X, a player looks at the top X cards of their library, then puts any number of them on the bottom and the rest on top in any order.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 2 },
          { kind: "each-player-may", who: "each-opponent", prompt: "Scry 1?", effect: { kind: "scry", amount: 1 } },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
