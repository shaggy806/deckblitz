import { defineCard } from "../define.js";

// EDHREC rank 1671.

const CAST_TEXT = "Your opponents can't cast spells with even mana values. (Zero is even.)";
const BLOCK_TEXT = "Your opponents can't block with creatures with even mana values.";

export default defineCard({
  name: "Void Winnower",
  manaCost: "{9}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 11,
  toughness: 9,
  text: `${CAST_TEXT}\n${BLOCK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "opponents", spells: { manaValueParity: "even" } },
      text: CAST_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent", manaValueParity: "even" } },
      restrictions: ["cant-block"],
      text: BLOCK_TEXT,
    },
  ],
});
