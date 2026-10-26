import { defineCard } from "../define.js";

// Dissension.
const TEXT = "{T}: This creature deals 1 damage to target creature and that creature's controller loses 1 life.";

export default defineCard({
  name: "Rakdos Ickspitter",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "lose-life", amount: 1, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
