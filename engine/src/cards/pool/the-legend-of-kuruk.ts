import { defineCard } from "../define.js";

// EDHREC rank 6145. Chapter III is Azusa's Many Journeys': it comes back as
// Avatar Kuruk, a new object; a single-faced copy stays in exile (the ruling).

const CHAPTER_I_II = "I, II — Scry 2, then draw a card.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "The Legend of Kuruk",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I_II}\n${CHAPTER_III}`,
  faces: ["The Legend of Kuruk", "Avatar Kuruk"],
  transform: true,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 2 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_I_II,
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
