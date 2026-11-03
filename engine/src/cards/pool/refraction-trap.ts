import { defineCard } from "../define.js";

// Rulings:
//   [2010-03-01] Refraction Trap doesn't target the source of the damage it prevents. You choose
//     that source as Refraction Trap resolves. If you cast Refraction Trap for {W}, the source you
//     choose doesn't have to be the red instant or sorcery spell an opponent cast.
//   [2010-03-01] If Refraction Trap doesn't prevent any damage, Refraction Trap won't deal any
//     damage itself.
//   [2010-03-01] Refraction Trap's only target is the permanent or player it may deal damage to.
//     You choose that target as you cast Refraction Trap, not at the time it prevents damage.
//   [2010-03-01] Refraction Trap's effect is not a redirection effect. If it prevents damage,
//     Refraction Trap (not the chosen source) deals damage to the targeted permanent or player as
//     part of that prevention effect.
//   [2010-03-01] Whether the targeted permanent or player is still a legal target is no longer
//     checked after Refraction Trap resolves.
export default defineCard({
  name: "Refraction Trap",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If an opponent cast a red instant or sorcery spell this turn, you may pay {W} rather than pay this spell's mana cost.\nPrevent the next 3 damage that a source of your choice would deal to you and/or permanents you control this turn. If damage is prevented this way, Refraction Trap deals that much damage to any target.",
  alternativeCost: {
    mana: "{W}",
    condition: { kind: "cast-this-turn", who: "opponent", filter: { typesAnyOf: ["instant", "sorcery"], colors: ["R"] } },
  },
  targets: ["any-target"],
  effect: {
    kind: "prevent-damage-from-chosen-source",
    to: "your-side",
    amount: 3,
    then: { kind: "damage", amount: "x", target: 0 },
  },
});
