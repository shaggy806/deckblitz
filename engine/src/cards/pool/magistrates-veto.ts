import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 25484. Bedlam's restriction on the
// creatures that are white or blue, each player's.

const TEXT = "White creatures and blue creatures can't block.";

export default defineCard({
  name: "Magistrate's Veto",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", anyOf: [{ colors: ["W"] }, { colors: ["U"] }] } },
      restrictions: ["cant-block"],
      text: TEXT,
    },
  ],
});
