import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 24752.

export default defineCard({
  name: "Evanescent Intellect",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has \"{1}{U}, {T}: Target player mills three cards.\"",
  targets: ["creature"],
  // TODO(scaffold): Enchanted creature has "{1}{U}, {T}: Target player mills three cards."
});
