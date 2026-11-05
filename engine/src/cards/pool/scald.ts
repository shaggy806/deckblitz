import { defineCard } from "../define.js";

// EDHREC rank 25668.

export default defineCard({
  name: "Scald",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Whenever a player taps an Island for mana, this enchantment deals 1 damage to that player.",
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "any", filter: { subtype: "Island" } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-player" },
      resolve: null,
      text: "Whenever a player taps an Island for mana, this enchantment deals 1 damage to that player.",
    },
  ],
});
