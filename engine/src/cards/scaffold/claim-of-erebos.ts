import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 26366.

export default defineCard({
  name: "Claim of Erebos",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has \"{1}{B}, {T}: Target player loses 2 life.\"",
  targets: ["creature"],
  // TODO(scaffold): Enchanted creature has "{1}{B}, {T}: Target player loses 2 life."
});
