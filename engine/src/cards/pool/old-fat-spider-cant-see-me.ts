import { defineCard } from "../define.js";

// EDHREC rank 17489.
//
// "For as long as this Saga remains on the battlefield" is `"while-source"`
// for both chapters: the Saga, in the stint the chapter resolved in.

const CHAPTER_I = "I — Target creature you control gains hexproof for as long as this Saga remains on the battlefield.";
const CHAPTER_II =
  "II — Prevent all damage that would be dealt by up to one target creature for as long as this Saga remains on the battlefield.";
const CHAPTER_III_IV = "III, IV — Draw a card.";

export default defineCard({
  name: "Old Fat Spider Can't See Me",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III_IV}`,
  chapters: [
    {
      at: [1],
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "while-source" },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "damage-rule", by: { target: 0 }, duration: "while-source" },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3, 4],
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: CHAPTER_III_IV,
    },
  ],
});
