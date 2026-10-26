import { defineCard } from "../define.js";

// EDHREC rank 22024.

const TEXT = "Black creatures can't attack or block.";

export default defineCard({
  name: "Light of Day",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["B"] } },
      restrictions: ["cant-attack", "cant-block"],
      text: TEXT,
    },
  ],
});
