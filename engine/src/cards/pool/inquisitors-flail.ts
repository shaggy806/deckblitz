import { defineCard } from "../define.js";

// EDHREC rank 4121.
//
// Two damage replacements naming the Equipment's host — as the source of the
// combat damage, and as its recipient from another creature. Two Flails
// multiply by four (the ruling): each is its own replacement. Damage is
// divided first and each part doubled (the ruling) — a replacement applies
// to each assigned amount.

export default defineCard({
  name: "Inquisitor's Flail",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "If equipped creature would deal combat damage, it deals double that damage instead.\nIf another creature would deal combat damage to equipped creature, it deals double that damage to equipped creature instead.\nEquip {2}",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", fromAttached: true, combat: true, multiplier: 2 },
      text: "If equipped creature would deal combat damage, it deals double that damage instead.",
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        to: "attached",
        source: { type: "creature" },
        combat: true,
        multiplier: 2,
      },
      text: "If another creature would deal combat damage to equipped creature, it deals double that damage to equipped creature instead.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
