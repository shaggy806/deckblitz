import { defineCard } from "../define.js";

// EDHREC rank 9929.

export default defineCard({
  name: "Farideh's Fireball",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Farideh's Fireball deals 5 damage to target creature or planeswalker. Roll a d20.\n1—9 | Farideh's Fireball deals 2 damage to each player.\n10—20 | Farideh's Fireball deals 2 damage to each opponent.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: { kind: "damage", amount: 2, who: "each-player" } },
          { min: 10, effect: { kind: "damage", amount: 2, who: "each-opponent" } },
        ],
      },
    ],
  },
});
