import { defineCard } from "../define.js";

export default defineCard({
  name: "Ephara's Radiance",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has \"{1}{W}, {T}: You gain 3 life.\"",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}{W}", tap: true },
          targets: [],
          effect: { kind: "gain-life", amount: 3 },
          resolve: null,
          text: "{1}{W}, {T}: You gain 3 life.",
        },
      ],
      text: "Enchanted creature has \"{1}{W}, {T}: You gain 3 life.\"",
    },
  ],
});
