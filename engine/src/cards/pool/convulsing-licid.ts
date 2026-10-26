import { defineCard } from "../define.js";

// EDHREC rank 28345.
//
// Rulings:
//   [2013-04-15] If a spell that can target enchantments but not creatures (such as Clear) is cast
//     targeting the Licid after it has become an enchantment, but the Licid's controller pays the
//     cost, the Licid will no longer be an enchantment. This will result in the spell failing to
//     resolve for having no legal targets.
//   [2013-04-15] Paying the cost to end the effect is a special action and can't be responded to.

export default defineCard({
  name: "Convulsing Licid",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Licid"],
  power: 2,
  toughness: 2,
  text: "{R}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {R} to end this effect.\nEnchanted creature can't block.",
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "become-licid-aura", target: 0, endCost: "{R}" },
      resolve: null,
      text: "{R}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {R} to end this effect.",
      licid: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-block"],
      text: "Enchanted creature can't block.",
    },
  ],
});
