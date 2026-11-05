import { defineCard } from "../define.js";

// EDHREC rank 28227.

export default defineCard({
  name: "Elite Headhunter",
  manaCost: "{B/R}{B/R}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\n{B/R}{B/R}{B/R}, Sacrifice another creature or an artifact: This creature deals 2 damage to target creature or planeswalker.",
  activated: [
    {
      cost: {
        mana: "{B/R}{B/R}{B/R}",
        tap: false,
        sacrifice: { filter: { anyOf: [{ type: "creature", isSource: false }, { type: "artifact" }] } },
      },
      targets: [
        {
          kind: "permanent",
          whose: "any",
          filter: { typesAnyOf: ["creature", "planeswalker"] },
        },
      ],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{B/R}{B/R}{B/R}, Sacrifice another creature or an artifact: This creature deals 2 damage to target creature or planeswalker.",
    },
  ],
});
