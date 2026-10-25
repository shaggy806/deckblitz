import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 21838.
//
// Rulings:
//   [2014-02-01] If you don't want the target creature to be able to block, Forgestoker Dragon's
//     activated ability must be activated during the declare attackers step.
//   [2014-02-01] Forgestoker Dragon's activated ability can target any creature, not just
//     creatures controlled by the defending player or ones that could block.

export default defineCard({
  name: "Forgestoker Dragon",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\n{1}{R}: This creature deals 1 damage to target creature. That creature can't block this combat. Activate only if this creature is attacking.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: ["creature"],
      effect: null,
      resolve: null,
      text: "{1}{R}: This creature deals 1 damage to target creature. That creature can't block this combat. Activate only if this creature is attacking.",
      // TODO(scaffold): a restriction: "Activate only if ~ is attacking."
      // TODO(scaffold): That creature can't block this combat.
      // parsed "~ deals 1 damage to target creature." as { kind: "damage", amount: 1, target: 0 }
    },
  ],
});
