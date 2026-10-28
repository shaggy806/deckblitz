import { defineCard } from "../define.js";

// EDHREC rank 5148. Chapter III is Befriending the Moths' shape; the back face
// is O-Kagachi Made Manifest.
//
// Rulings:
//   [2022-02-18] The mana value of a transforming double-faced card is the mana value of its front
//     face, no matter which face is up.
//   [2022-02-18] If you are instructed to put a card that isn't a double-faced card onto the
//     battlefield transformed, it will not enter the battlefield at all. In that case, it stays in
//     the zone it was previously in.

const CHAPTER_I = "I — Exile target nonland permanent an opponent controls.";
const CHAPTER_II =
  "II — Return up to one other target nonland permanent to its owner's hand. Then each opponent discards a card.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "The Kami War",
  manaCost: "{1}{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  faces: ["The Kami War", "O-Kagachi Made Manifest"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [{ kind: "optional", of: { kind: "other", of: "nonland-permanent" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "discard", target: "each-opponent", amount: 1 },
        ],
      },
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
