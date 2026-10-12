import { defineCard } from "../define.js";

export default defineCard({
  name: "Death Cultist",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "Sacrifice this creature: Target player loses 1 life and you gain 1 life.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 1, target: 0 }, { kind: "gain-life", amount: 1 }],
      },
      resolve: null,
      text: "Sacrifice this creature: Target player loses 1 life and you gain 1 life.",
    },
  ],
});
