import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 27725.

export default defineCard({
  name: "Power Leak",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant enchantment\nAt the beginning of the upkeep of enchanted enchantment's controller, that player may pay any amount of mana. This Aura deals 2 damage to that player. Prevent X of that damage, where X is the amount of mana that player paid this way.",
  targets: ["enchantment"],
  // TODO(scaffold): At the beginning of the upkeep of enchanted enchantment's controller, that player may pay any amount of mana. This Aura deals 2 damage to that player. Prevent X of that damage, where X is the amount of mana that player paid this way.
});
