import { defineCard } from "../define.js";

// EDHREC rank 4782. Chapter III is Befriending the Moths': it comes back as
// Likeness of the Seeker, a new object that's no Saga. A single-faced copy of
// it stays in exile (its ruling, rule 712.14a).

const CHAPTER_I = "I — You may play an additional land this turn.";
const CHAPTER_II = "II — You gain 3 life.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Azusa's Many Journeys",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  faces: ["Azusa's Many Journeys", "Likeness of the Seeker"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "additional-land-drop", amount: 1 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: CHAPTER_II,
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
