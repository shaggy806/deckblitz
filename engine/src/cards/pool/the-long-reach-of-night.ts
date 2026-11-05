import { defineCard } from "../define.js";

const CHAPTER_I = "I, II — Each opponent sacrifices a creature of their choice unless they discard a card.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "The Long Reach of Night",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_III}`,
  faces: ["The Long Reach of Night", "Animus of Night's Reach"],
  transform: true,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [{ discard: 1, text: "Discard a card" }],
        ifDidnt: { kind: "sacrifice", who: "that-player", filter: { type: "creature" }, count: 1 },
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
