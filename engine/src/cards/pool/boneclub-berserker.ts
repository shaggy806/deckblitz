import { defineCard } from "../define.js";

// EDHREC rank 12605.
//
// "Each other Goblin you control" is any Goblin permanent, not only a
// creature (a kindred Goblin counts), so the filter names no card type.
const TEXT = "This creature gets +2/+0 for each other Goblin you control.";

export default defineCard({
  name: "Boneclub Berserker",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Berserker"],
  power: 2,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Goblin", controlledBy: "you" }, pt: [2, 0], excludeSelf: true },
      text: TEXT,
    },
  ],
});
