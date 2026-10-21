import { defineCard } from "../define.js";

// EDHREC rank 31126.

export default defineCard({
  name: "Angrath's Ambusher",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 2,
  toughness: 3,
  text: "This creature gets +2/+0 as long as you control an Angrath planeswalker.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Angrath" }, atLeast: 1 },
      grantPt: [2, 0],
      text: "This creature gets +2/+0 as long as you control an Angrath planeswalker.",
    },
  ],
});
