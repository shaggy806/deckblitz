import { defineCard } from "../define.js";

// EDHREC rank 31767.

const TEXT = "This creature can't be blocked by creatures with horsemanship.";

export default defineCard({
  name: "Taoist Mystic",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Mystic"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { keyword: "horsemanship" }, text: TEXT }],
});
