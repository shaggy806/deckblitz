import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 21227.

export default defineCard({
  name: "Epiphany Storm",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has \"{R}, {T}, Discard a card: Draw a card.\"",
  targets: ["creature"],
  // TODO(scaffold): Enchanted creature has "{R}, {T}, Discard a card: Draw a card."
});
