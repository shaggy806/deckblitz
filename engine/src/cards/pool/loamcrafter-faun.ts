import { defineCard } from "../define.js";

// EDHREC rank 9303.
//
// The discard is the "may" (none at all is the decline), and the targets are
// chosen for the reflexive ability as it goes on the stack (the ruling), so
// the count is its `value`, the lands discarded.

const TEXT =
  "When this creature enters, you may discard one or more land cards. When you do, return up to that many target nonland permanent cards from your graveyard to your hand.";
const REFLEXIVE_TEXT = "Return up to that many target nonland permanent cards from your graveyard to your hand.";

export default defineCard({
  name: "Loamcrafter Faun",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Satyr", "Druid"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 0, anyNumber: true, filter: { type: "land" } },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", atLeast: 1 },
            then: {
              kind: "reflexive-trigger",
              targets: [
                {
                  kind: "any-number",
                  of: {
                    kind: "card-in-graveyard",
                    whose: "you",
                    filter: {
                      typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"],
                      notTypes: ["land"],
                    },
                  },
                  max: { triggerValue: true },
                },
              ],
              value: { thisWay: "discarded" },
              effect: {
                kind: "for-each-target",
                from: 0,
                simultaneous: true,
                effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
              },
              text: REFLEXIVE_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
