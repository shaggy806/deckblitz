import { defineCard } from "../define.js";

const TEXT = "Whenever a player taps a nonbasic land for mana, this enchantment deals 1 damage to that player.";

export default defineCard({
  name: "Burning Earth",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "any", filter: { type: "land", notSupertype: "basic" } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
