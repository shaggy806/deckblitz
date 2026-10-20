import { defineCard } from "../define.js";

// EDHREC rank 15761. Chapter III is Michiko's Reign of Truth's: it comes back
// as Hand of Enlightenment, a new object that's no Saga.

const CHAPTER_I = "I — Scry 2.";
const CHAPTER_II = "II — You gain 2 life.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Era of Enlightenment",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  faces: ["Era of Enlightenment", "Hand of Enlightenment"],
  transform: true,
  chapters: [
    { at: [1], targets: [], effect: { kind: "scry", amount: 2 }, resolve: null, text: CHAPTER_I },
    { at: [2], targets: [], effect: { kind: "gain-life", amount: 2 }, resolve: null, text: CHAPTER_II },
    {
      at: [3],
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
