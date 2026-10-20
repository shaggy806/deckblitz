import { defineCard } from "../define.js";

// EDHREC rank 11947. Chapter III is Michiko's Reign of Truth's: it comes back
// as Nezumi Road Captain, a new object that's no Saga.

const CHAPTER_I = "I, II — Each opponent loses 1 life and you gain 1 life.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Okiba Reckoner Raid",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_III}`,
  faces: ["Okiba Reckoner Raid", "Nezumi Road Captain"],
  transform: true,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
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
