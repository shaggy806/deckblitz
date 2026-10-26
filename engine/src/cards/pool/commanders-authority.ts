import { defineCard } from "../define.js";

// Rulings:
//   [2012-05-01] The controller of the enchanted creature gets the token.

export default defineCard({
  name: "Commander's Authority",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has \"At the beginning of your upkeep, create a 1/1 white Human creature token.\"",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "create-token", token: "Human Token", count: 1 },
          resolve: null,
          text: "At the beginning of your upkeep, create a 1/1 white Human creature token.",
        },
      ],
      text: "Enchanted creature has \"At the beginning of your upkeep, create a 1/1 white Human creature token.\"",
    },
  ],
});
