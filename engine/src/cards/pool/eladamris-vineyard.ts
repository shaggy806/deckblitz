import { defineCard } from "../define.js";

export default defineCard({
  name: "Eladamri's Vineyard",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "At the beginning of each player's first main phase, that player adds {G}{G}.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "any" },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 2, who: "active-player" },
      resolve: null,
      text: "At the beginning of each player's first main phase, that player adds {G}{G}.",
    },
  ],
});
