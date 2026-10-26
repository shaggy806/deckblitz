import { defineCard } from "../define.js";

// EDHREC rank 29641.
//
// Rulings:
//   [2013-04-15] If a spell that can target enchantments but not creatures (such as Clear) is cast
//     targeting the Licid after it has become an enchantment, but the Licid's controller pays the
//     cost, the Licid will no longer be an enchantment. This will result in the spell failing to
//     resolve for having no legal targets.
//   [2013-04-15] Paying the cost to end the effect is a special action and can't be responded to.

export default defineCard({
  name: "Stinging Licid",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Licid"],
  power: 1,
  toughness: 1,
  text: "{1}{U}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {U} to end this effect.\nWhenever enchanted creature becomes tapped, this creature deals 2 damage to that creature's controller.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: ["creature"],
      effect: { kind: "become-licid-aura", target: 0, endCost: "{U}" },
      resolve: null,
      text: "{1}{U}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {U} to end this effect.",
      licid: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: "Whenever enchanted creature becomes tapped, this creature deals 2 damage to that creature's controller.",
    },
  ],
});
