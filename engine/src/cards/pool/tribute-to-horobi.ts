import { defineCard } from "../define.js";

// EDHREC rank 9092.
// Makes Rat Rogue → new token "Rat Rogue Token (Tribute to Horobi)".
// Back face: Echo of Death's Wail (echo-of-deaths-wail.ts).
//
// Rulings:
//   [2022-02-18] If you are instructed to put a card that isn't a double-faced card onto the
//     battlefield transformed, it will not enter the battlefield at all. In that case, it stays in
//     the zone it was previously in.
//
// Each opponent creates the Rats under their own control; the back face takes
// them all back when it enters.
const CHAPTER_I_II = "I, II — Each opponent creates a 1/1 black Rat Rogue creature token.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Tribute to Horobi",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I_II}\n${CHAPTER_III}`,
  faces: ["Tribute to Horobi", "Echo of Death's Wail"],
  transform: true,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "create-token",
        token: "Rat Rogue Token (Tribute to Horobi)",
        count: 1,
        who: "each-opponent",
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
