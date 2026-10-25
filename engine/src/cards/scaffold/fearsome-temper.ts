import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 26712.
//
// Rulings:
//   [2014-02-01] The target creature can still block other attacking creatures.
//   [2014-02-01] The activated ability granted by Fearsome Temper can’t change or undo a block
//     that’s already happened. For it to have an effect, you must activate it no later than the
//     declare attackers step.

export default defineCard({
  name: "Fearsome Temper",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2 and has \"{2}{R}: Target creature can't block this creature this turn.\"",
  targets: ["creature"],
  // TODO(scaffold): Enchanted creature gets +2/+2 and has "{2}{R}: Target creature can't block this creature this turn."
});
