import { defineCard } from "../define.js";

// EDHREC rank 10233.
//
// Rulings:
//   [2021-02-05] Crewing a Vehicle doesn't cause Giant Ox's power or toughness to change.
//
// Crew only (rule 702.122a): it saddles, and pays teamwork, with its power.
const TEXT = "This creature crews Vehicles using its toughness rather than its power.";

export default defineCard({
  name: "Giant Ox",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Ox"],
  power: 0,
  toughness: 6,
  text: TEXT,
  static: [{ affects: { scope: "self" }, crewsAs: { toughness: true }, text: TEXT }],
});
