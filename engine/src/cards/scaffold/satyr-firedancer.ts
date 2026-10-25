import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 16532.

export default defineCard({
  name: "Satyr Firedancer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Satyr"],
  power: 1,
  toughness: 1,
  text: "Whenever an instant or sorcery spell you control deals damage to an opponent, this creature deals that much damage to target creature that player controls.",
  // TODO(scaffold): Whenever an instant or sorcery spell you control deals damage to an opponent, this creature deals that much damage to target creature that player controls.
});
