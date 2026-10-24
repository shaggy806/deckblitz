import { defineCard } from "../define.js";

// EDHREC rank 9736.
// II and III each set up a delayed triggered ability for the rest of that
// turn (rule 603.7c): every creature entering under your control drains 1.
const CHAPTER_I = "I — You draw two cards and you lose 2 life.";
const CHAPTER_II_III_BODY = "Whenever a creature you control enters this turn, each opponent loses 1 life and you gain 1 life.";
const CHAPTER_II_III = `II, III — ${CHAPTER_II_III_BODY}`;

export default defineCard({
  name: "Thunder of Unity",
  manaCost: "{R}{W}{B}",
  colors: ["W", "B", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "lose-life", amount: 2 },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2, 3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } } },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 1, who: "each-opponent" },
            { kind: "gain-life", amount: 1 },
          ],
        },
        text: CHAPTER_II_III_BODY,
      },
      resolve: null,
      text: CHAPTER_II_III,
    },
  ],
});
