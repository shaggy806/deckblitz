import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 9261.
const CHAPTER_I = "I — Surveil 3.";
const CHAPTER_II = "II — When you next cast a creature spell this turn, copy it, except the copy isn't legendary.";
const CHAPTER_III =
  "III — Choose a card name. Whenever a creature with the chosen name deals combat damage to a player this turn, draw a card.";

export default defineCard({
  name: "The Clone Saga",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    { at: [1], targets: [], effect: { kind: "surveil", amount: 3 }, resolve: null, text: CHAPTER_I },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { nextSpell: { type: "creature" } },
        effect: { kind: "copy-spell", target: "trigger-spell", except: { notLegendary: true } },
        text: "When you next cast a creature spell this turn, copy it, except the copy isn't legendary.",
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "choose-card-name",
        then: {
          kind: "delayed-trigger",
          at: {
            whenever: {
              on: "deals-combat-damage-to-player",
              who: "any",
              filter: { type: "creature", hasName: CHOSEN_CARD_NAME },
            },
          },
          effect: { kind: "draw", amount: 1 },
          text: "Whenever a creature with the chosen name deals combat damage to a player this turn, draw a card.",
        },
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
