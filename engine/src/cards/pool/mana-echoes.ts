import { defineCard } from "../define.js";

// EDHREC rank 4032.
//
// Rulings:
//   [2020-08-07] The creature entering the battlefield shares a creature type with itself if it
//     has any creature types, so Mana Echoes usually adds at least {C}.
//   [2020-08-07] Mana Echoes counts the number of creatures that share a type, not how many types
//     they share.
//   [2020-08-07] The amount of mana to add is determined only as the triggered ability of Mana
//     Echoes resolves. The ability isn't a mana ability; players may respond to it.

const TEXT =
  "Whenever a creature enters, you may add an amount of {C} equal to the number of creatures you control that share a creature type with it.";

export default defineCard({
  name: "Mana Echoes",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Add {C} for each creature you control that shares a creature type with it?",
        effect: {
          kind: "add-mana",
          mana: "C",
          // Counted as it resolves; the entering creature counts itself when
          // you control it and it has a creature type.
          amount: { countOf: { type: "creature", controlledBy: "you", sharesCreatureTypeWith: "trigger-object" } },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
