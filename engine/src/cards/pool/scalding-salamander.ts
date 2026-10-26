import { defineCard } from "../define.js";

// EDHREC rank 28350.
//
// Rulings:
//   [2004-10-04] The ability triggers on the declaration of attackers and will resolve before
//     blockers are declared.
//
// Swathcutter Giant's "each creature defending player controls" (`whose:
// "trigger-player"`), less the fliers, behind a `may`.
const TEXT =
  "Whenever this creature attacks, you may have it deal 1 damage to each creature without flying defending player controls.";

export default defineCard({
  name: "Scalding Salamander",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Salamander"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Scalding Salamander deal 1 damage to each creature without flying defending player controls?",
        effect: {
          kind: "damage-all",
          filter: { type: "creature", notKeyword: "flying" },
          amount: 1,
          whose: "trigger-player",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
