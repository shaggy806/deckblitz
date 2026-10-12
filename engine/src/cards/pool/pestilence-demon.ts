import { defineCard } from "../define.js";

export default defineCard({
  name: "Pestilence Demon",
  manaCost: "{5}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 7,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\n{B}: This creature deals 1 damage to each creature and each player.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
          { kind: "damage", amount: 1, who: "each-player" },
        ],
      },
      resolve: null,
      text: "{B}: This creature deals 1 damage to each creature and each player.",
    },
  ],
});
