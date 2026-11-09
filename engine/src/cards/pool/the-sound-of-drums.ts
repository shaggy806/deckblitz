import { defineCard } from "../define.js";

export default defineCard({
  name: "The Sound of Drums",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  targets: ["creature"],
  text: "Enchant creature\nEnchanted creature is goaded.\nIf enchanted creature would deal combat damage to a permanent or player, it deals double that damage instead.\n{2}{R}: Return this card from your graveyard to your hand.",
  static: [
    { affects: { scope: "attached" }, goads: true, text: "Enchanted creature is goaded." },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", fromAttached: true, combat: true, instead: { modify: { times: 2 } } },
      text: "If enchanted creature would deal combat damage to a permanent or player, it deals double that damage instead.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: "{2}{R}: Return this card from your graveyard to your hand.",
    },
  ],
});
