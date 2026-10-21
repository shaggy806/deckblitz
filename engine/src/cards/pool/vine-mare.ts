import { defineCard } from "../define.js";

// EDHREC rank 23271.

const EVASION_TEXT = "This creature can't be blocked by black creatures.";

export default defineCard({
  name: "Vine Mare",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Horse"],
  power: 5,
  toughness: 3,
  keywords: ["hexproof"],
  text: `Hexproof (This creature can't be the target of spells or abilities your opponents control.)\n${EVASION_TEXT}`,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { colors: ["B"] }, text: EVASION_TEXT }],
});
