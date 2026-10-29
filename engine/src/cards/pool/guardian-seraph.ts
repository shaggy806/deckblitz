import { defineCard } from "../define.js";

// EDHREC rank 21176.
//
// Rulings:
//   [2009-10-01] The effects from multiple Guardian Seraphs are cumulative.
//   [2009-10-01] Spells and permanents have controllers, but cards that aren’t on the stack or the
//     battlefield don’t. If a source without a controller (such as a cycled Jund Sojourners, for
//     example) would deal damage to you, 1 of that damage is prevented if an opponent owns that
//     source.
//   [2009-10-01] This ability prevents 1 damage from each source an opponent controls each time
//     that source would deal damage to you. It prevents 1 of any damage, not just combat damage.

export default defineCard({
  name: "Guardian Seraph",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nIf a source an opponent controls would deal damage to you, prevent 1 of that damage.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "you", source: { controlledBy: "opponent" }, preventAmount: 1 },
      text: "If a source an opponent controls would deal damage to you, prevent 1 of that damage.",
    },
  ],
});
