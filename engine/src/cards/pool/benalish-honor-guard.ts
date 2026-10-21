import { defineCard } from "../define.js";

// EDHREC rank 26238.

const TEXT = "This creature gets +1/+0 for each legendary creature you control.";

export default defineCard({
  name: "Benalish Honor Guard",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "creature", supertype: "legendary", controlledBy: "you" }, pt: [1, 0] },
      text: TEXT,
    },
  ],
});
