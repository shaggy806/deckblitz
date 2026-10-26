import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 20831.
//
// "Enchant green creature" is the target filter, which the state-based check
// reads too (704.5m): it falls off a creature that stops being green.
//
// Rulings:
//   [2006-02-01] Wurmweaver Coil can enchant only a green creature. It can't enter attached to a
//     nongreen creature, it can't be moved onto a nongreen creature, and if the creature it's
//     attached to stops being green, the Aura is put into its owner's graveyard.

export default defineCard({
  name: "Wurmweaver Coil",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant green creature\nEnchanted creature gets +6/+6.\n{G}{G}{G}, Sacrifice this Aura: Create a 6/6 green Wurm creature token.",
  targets: [{ kind: "permanent", filter: { type: "creature", colors: ["G"] } }],
  activated: [
    {
      cost: { mana: "{G}{G}{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "6/6 Wurm Token", count: 1 },
      resolve: null,
      text: "{G}{G}{G}, Sacrifice this Aura: Create a 6/6 green Wurm creature token.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [6, 6], text: "Enchanted creature gets +6/+6." }],
});
