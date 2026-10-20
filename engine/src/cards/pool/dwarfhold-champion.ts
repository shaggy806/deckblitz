import { defineCard } from "../define.js";

// EDHREC rank 23419.
export default defineCard({
  name: "Dwarfhold Champion",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 3,
  toughness: 1,
  text: "As long as this creature is equipped, it gets +0/+2.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { equipped: true } },
      grantPt: [0, 2],
      text: "As long as this creature is equipped, it gets +0/+2.",
    },
  ],
});
