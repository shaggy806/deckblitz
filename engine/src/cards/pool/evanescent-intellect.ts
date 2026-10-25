import { defineCard } from "../define.js";

export default defineCard({
  name: "Evanescent Intellect",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has \"{1}{U}, {T}: Target player mills three cards.\"",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}{U}", tap: true },
          targets: ["player"],
          effect: { kind: "mill", target: 0, amount: 3 },
          resolve: null,
          text: "{1}{U}, {T}: Target player mills three cards.",
        },
      ],
      text: "Enchanted creature has \"{1}{U}, {T}: Target player mills three cards.\"",
    },
  ],
});
