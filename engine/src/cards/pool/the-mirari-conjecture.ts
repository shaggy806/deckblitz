import { defineCard } from "../define.js";

// EDHREC rank 12971.
// III is a delayed triggered ability for the rest of the turn (rule
// 603.7c): every instant or sorcery spell you cast is copied, targets or
// not, the copy keeping its modes and X and resolving first (the rulings).
const CHAPTER_I = "I — Return target instant card from your graveyard to your hand.";
const CHAPTER_II = "II — Return target sorcery card from your graveyard to your hand.";
const CHAPTER_III_BODY =
  "Until end of turn, whenever you cast an instant or sorcery spell, copy it. You may choose new targets for the copy.";
const CHAPTER_III = `III — ${CHAPTER_III_BODY}`;

export default defineCard({
  name: "The Mirari Conjecture",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "instant" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "sorcery" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } } },
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
        text: "Whenever you cast an instant or sorcery spell, copy it. You may choose new targets for the copy.",
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
