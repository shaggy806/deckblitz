import { defineCard } from "../define.js";

// EDHREC rank 19465.

const EVASION_TEXT = "This creature can't be blocked by creatures with flying.";

export default defineCard({
  name: "Skyscythe Engulfer",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 6,
  toughness: 5,
  keywords: ["reach", "trample"],
  text: `Reach, trample\n${EVASION_TEXT}`,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { keyword: "flying" }, text: EVASION_TEXT }],
});
