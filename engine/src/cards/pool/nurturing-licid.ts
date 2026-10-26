import { defineCard } from "../define.js";

// EDHREC rank 27143.
//
// Rulings:
//   [2013-04-15] If a spell that can target enchantments but not creatures (such as Clear) is cast
//     targeting the Licid after it has become an enchantment, but the Licid's controller pays the
//     cost, the Licid will no longer be an enchantment. This will result in the spell failing to
//     resolve for having no legal targets.
//   [2013-04-15] Paying the cost to end the effect is a special action and can't be responded to.

export default defineCard({
  name: "Nurturing Licid",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Licid"],
  power: 1,
  toughness: 1,
  text: "{G}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {G} to end this effect.\n{G}: Regenerate enchanted creature.",
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: ["creature"],
      effect: { kind: "become-licid-aura", target: 0, endCost: "{G}" },
      resolve: null,
      text: "{G}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {G} to end this effect.",
      licid: true,
    },
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: "{G}: Regenerate enchanted creature.",
    },
  ],
});
