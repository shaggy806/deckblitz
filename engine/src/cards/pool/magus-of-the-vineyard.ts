import { defineCard } from "../define.js";

export default defineCard({
  name: "Magus of the Vineyard",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
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
