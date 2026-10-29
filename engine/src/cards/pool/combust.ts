import { defineCard } from "../define.js";

// EDHREC rank 24153.
//
// Rulings:
//   [2010-08-15] If the targeted creature is an illegal target by the time Combust would resolve,
//     Combust won’t resolve for having an illegal target.
//   [2010-08-15] Combust can be targeted by spells and abilities that try to counter it (such as
//     Cancel). Those spells and abilities will resolve, but the part of their effect that would
//     counter Combust won’t do anything. Any other effects those spells and abilities have will
//     work as normal.
//   [2010-08-15] Spells that create prevention effects affecting the targeted creature can still
//     be cast, and abilities that create prevention effects affecting the targeted creature can
//     still be activated. However, damage prevention shields (including those created before
//     Combust was cast) don’t have any effect on the damage dealt by Combust. If such a prevention
//     effect has an additional effect, the additional effect will still work (if possible).
//   [2010-08-15] If a static ability would prevent damage from being dealt to the targeted
//     creature, it fails to prevent the damage dealt by Combust. If that ability has an additional
//     effect that doesn’t depend on the amount of damage prevented, that additional effect will
//     still work. It’s applied just once as Combust resolves.
//   [2010-08-15] If a creature is dealt lethal damage by Combust, it can still regenerate. If it
//     does, the damage marked on it will be removed from it.
//   [2010-08-15] Effects that replace or redirect damage without using the word “prevent” aren’t
//     affected by Combust; they’ll work as normal.

export default defineCard({
  name: "Combust",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nCombust deals 5 damage to target white or blue creature. The damage can't be prevented.",
  targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["W"] }, { colors: ["U"] }] } }],
  effect: { kind: "damage", amount: 5, target: 0, cantBePrevented: true },
});
