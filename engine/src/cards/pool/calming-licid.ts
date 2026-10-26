import { defineCard } from "../define.js";

// EDHREC rank 29005.
//
// Rulings:
//   [2013-04-15] If a spell that can target enchantments but not creatures (such as Clear) is cast
//     targeting the Licid after it has become an enchantment, but the Licid's controller pays the
//     cost, the Licid will no longer be an enchantment. This will result in the spell failing to
//     resolve for having no legal targets.
//   [2013-04-15] Paying the cost to end the effect is a special action and can't be responded to.

export default defineCard({
  name: "Calming Licid",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Licid"],
  power: 2,
  toughness: 2,
  text: "{W}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {W} to end this effect.\nEnchanted creature can't attack.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["creature"],
      effect: { kind: "become-licid-aura", target: 0, endCost: "{W}" },
      resolve: null,
      text: "{W}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {W} to end this effect.",
      licid: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack"],
      text: "Enchanted creature can't attack.",
    },
  ],
});
