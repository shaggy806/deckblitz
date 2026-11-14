import { defineCard } from "../define.js";

// EDHREC rank 14488. Doctor's companion read off the revealed card's text
// box (rule 702.124m): `hasKeyword: "doctors-companion"`.
const CHAPTER_TEXT =
  "I, II, III — Reveal cards from the top of your library until you reveal a Doctor card, a card with doctor's companion, or a Vehicle card. Put that card into your hand and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "An Unearthly Child",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_TEXT}`,
  chapters: [
    {
      at: [1, 2, 3],
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { anyOf: [{ subtype: "Doctor" }, { hasKeyword: "doctors-companion" }, { subtype: "Vehicle" }] },
        put: "hand",
        rest: "bottom-random",
      },
      resolve: null,
      text: CHAPTER_TEXT,
    },
  ],
});
