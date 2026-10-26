import { defineCard } from "../define.js";

// EDHREC rank 29968.
//
// Rulings:
//   [2013-04-15] If a spell that can target enchantments but not creatures (such as Clear) is cast
//     targeting the Licid after it has become an enchantment, but the Licid's controller pays the
//     cost, the Licid will no longer be an enchantment. This will result in the spell failing to
//     resolve for having no legal targets.
//   [2013-04-15] Paying the cost to end the effect is a special action and can't be responded to.

export default defineCard({
  name: "Leeching Licid",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Licid"],
  power: 1,
  toughness: 1,
  text: "{B}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {B} to end this effect.\nAt the beginning of the upkeep of enchanted creature's controller, this creature deals 1 damage to that player.",
  activated: [
    {
      cost: { mana: "{B}", tap: true },
      targets: ["creature"],
      effect: { kind: "become-licid-aura", target: 0, endCost: "{B}" },
      resolve: null,
      text: "{B}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {B} to end this effect.",
      licid: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "active-player" },
      resolve: null,
      text: "At the beginning of the upkeep of enchanted creature's controller, this creature deals 1 damage to that player.",
    },
  ],
});
