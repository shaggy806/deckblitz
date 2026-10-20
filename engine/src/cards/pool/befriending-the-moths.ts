import { defineCard } from "../define.js";

// EDHREC rank 17656. Chapter III is Michiko's Reign of Truth's: it comes back
// as Imperial Moth, a new object that's no Saga.

const CHAPTER_I = "I, II — Target creature you control gets +1/+1 and gains flying until end of turn.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Befriending the Moths",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_III}`,
  faces: ["Befriending the Moths", "Imperial Moth"],
  transform: true,
  chapters: [
    {
      at: [1, 2],
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
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
