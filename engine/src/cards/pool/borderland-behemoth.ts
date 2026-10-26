import { defineCard } from "../define.js";

const STATIC_TEXT = "This creature gets +4/+4 for each other Giant you control.";

export default defineCard({
  name: "Borderland Behemoth",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${STATIC_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Giant", controlledBy: "you" }, pt: [4, 4], excludeSelf: true },
      text: STATIC_TEXT,
    },
  ],
});
