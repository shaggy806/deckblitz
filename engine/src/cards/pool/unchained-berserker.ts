import { defineCard } from "../define.js";

// EDHREC rank 30726.

const ATTACK_TEXT = "This creature gets +2/+0 as long as it's attacking.";

export default defineCard({
  name: "Unchained Berserker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 1,
  toughness: 1,
  text: `Protection from white (This creature can't be blocked, targeted, dealt damage, enchanted, or equipped by anything white.)\n${ATTACK_TEXT}`,
  static: [
    { affects: { scope: "self" }, protection: { colors: ["W"] }, text: "Protection from white" },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantPt: [2, 0],
      text: ATTACK_TEXT,
    },
  ],
});
