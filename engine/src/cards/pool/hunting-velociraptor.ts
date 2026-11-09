import { defineCard } from "../define.js";

const TEXT =
  "Dinosaur spells you cast have prowl {2}{R}. (You may cast a spell for its prowl cost if you dealt combat damage to a player this turn with a creature with any of its creature types.)";

// Prowl compares the spell's creature types with those of the creatures
// that dealt combat damage this turn (its rulings) — the printed prowl's
// condition, for a granted prowl (rule 702.76a).
export default defineCard({
  name: "Hunting Velociraptor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  static: [{ affects: { scope: "self" }, grantsToSpells: { filter: { subtype: "Dinosaur" }, keywordValues: [{ keyword: "prowl", cost: "{2}{R}" }] }, text: TEXT }],
});
