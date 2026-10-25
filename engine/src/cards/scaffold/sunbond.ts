import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 8660.
//
// Rulings:
//   [2014-02-01] In some unusual cases, you can gain life even though your life total actually
//     decreases. For example, if you are being attacked by two 3/3 creatures and you block one
//     with a 2/2 creature with lifelink, your life total will decrease by 1 even though you’ve
//     gained 2 life. You’ll put two +1/+1 counters on the enchanted creature.
//   [2014-02-01] In a Two-Headed Giant game, life gained by your teammate won’t cause the ability
//     to trigger, even though it causes your team’s life total to increase.

export default defineCard({
  name: "Sunbond",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has \"Whenever you gain life, put that many +1/+1 counters on this creature.\"",
  targets: ["creature"],
  // TODO(scaffold): Enchanted creature has "Whenever you gain life, put that many +1/+1 counters on this creature."
});
