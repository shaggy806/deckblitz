import { defineCard } from "../define.js";

export default defineCard({
  name: "Oracle's Insight",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has \"{T}: Scry 1, then draw a card.\" (To scry 1, look at the top card of your library, then you may put that card on the bottom.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "scry", amount: 1, then: { kind: "draw", amount: 1 } },
          resolve: null,
          text: "{T}: Scry 1, then draw a card.",
        },
      ],
      text: "Enchanted creature has \"{T}: Scry 1, then draw a card.\"",
    },
  ],
});
