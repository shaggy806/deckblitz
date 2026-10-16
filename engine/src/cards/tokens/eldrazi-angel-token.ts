import { defineCard } from "../define.js";

// Angelic Aberration's Eldrazi Angel token: a 4/4 colorless Eldrazi Angel
// creature with flying and vigilance.

export default defineCard({
  name: "Eldrazi Angel Token",
  art: "c1ce831f-3e80-4205-884f-a912b5d53742",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance",
});
