import { defineCard } from "../define.js";

// EDHREC rank 16640.
// III is a delayed triggered ability for the rest of the turn (rule
// 603.7c): it may trigger several times, after the Saga is gone (the
// ruling).
const CHAPTER_I = "I — This Saga deals 4 damage to each non-Giant creature and each planeswalker.";
const CHAPTER_II = "II — Scry 3.";
const CHAPTER_III_BODY =
  "Whenever you cast a spell with mana value 5 or greater this turn, draw two cards, then discard a card.";
const CHAPTER_III = `III — ${CHAPTER_III_BODY}`;

export default defineCard({
  name: "Battle of Frost and Fire",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "damage-all",
        filter: {
          anyOf: [{ type: "creature", notSubtypes: ["Giant"] }, { type: "planeswalker" }],
        },
        amount: 4,
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "scry", amount: 3 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 5 } } } },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 2 },
            { kind: "discard", target: "you", amount: 1 },
          ],
        },
        text: CHAPTER_III_BODY,
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
