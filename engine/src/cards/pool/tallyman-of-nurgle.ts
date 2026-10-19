import { defineCard } from "../define.js";

// EDHREC rank 13093.
//
// Twinblade Assassins' intervening if (rule 603.4), then "instead" as a
// `conditional`: seven or more creature deaths this turn (any controller's,
// Emeritus of Woe's `turn-history`) draws seven and loses 7 in place of the
// one and 1, counted as it resolves.

const CHANT_TEXT =
  "The Seven-fold Chant — At the beginning of your end step, if a creature died this turn, you draw a card and you lose 1 life. If seven or more creatures died this turn, instead you draw seven cards and you lose 7 life.";

export default defineCard({
  name: "Tallyman of Nurgle",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Astartes", "Warrior"],
  power: 2,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${CHANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "creature-died-this-turn" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "turn-history",
          what: "died",
          who: "any-player",
          filter: { type: "creature" },
          atLeast: 7,
        },
        then: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 7 },
            { kind: "lose-life", amount: 7 },
          ],
        },
        else: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "lose-life", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: CHANT_TEXT,
    },
  ],
});
