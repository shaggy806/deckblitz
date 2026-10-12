import { defineCard } from "../define.js";

export default defineCard({
  name: "Gnawing Zombie",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 3,
  text: "{1}{B}, Sacrifice a creature: Target player loses 1 life and you gain 1 life.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 1, target: 0 }, { kind: "gain-life", amount: 1 }],
      },
      resolve: null,
      text: "{1}{B}, Sacrifice a creature: Target player loses 1 life and you gain 1 life.",
    },
  ],
});
