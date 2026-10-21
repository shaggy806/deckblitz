import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your end step, you may pay {2}{R} and sacrifice a nonland permanent. If you do, reveal cards from the top of your library until you reveal a nonland permanent card. Put that card onto the battlefield and the rest on the bottom of your library in a random order.";

// One cost of two parts, paid in full or not at all (its ruling): offered only
// while there's a nonland permanent to sacrifice (this one counts — it may be
// the one sacrificed), the {2}{R} as the "may", the sacrifice with it, and the
// reveal only once both were done.

export default defineCard({
  name: "Dreamshaper Shaman",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Minotaur", "Shaman"],
  power: 5,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { notTypes: ["land"] }, atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Pay {2}{R} and sacrifice a nonland permanent to reveal until a nonland permanent card?",
          cost: "{2}{R}",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "sacrifice", who: "you", filter: { notTypes: ["land"] }, count: 1 },
              {
                kind: "conditional",
                condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
                then: {
                  kind: "reveal-until",
                  filter: { typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"] },
                  put: "battlefield",
                  rest: "bottom-random",
                },
              },
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
