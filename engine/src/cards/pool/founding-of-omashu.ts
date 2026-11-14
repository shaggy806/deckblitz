import { defineCard } from "../define.js";

const CHAPTER_I = "I — Create two 1/1 white Ally creature tokens.";
const CHAPTER_II = "II — You may discard a card. If you do, draw a card.";
const CHAPTER_III = "III — Creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Founding of Omashu",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Ally Token", count: 2 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
          ],
        },
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
