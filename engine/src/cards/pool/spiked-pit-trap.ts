import { defineCard } from "../define.js";

// EDHREC rank 14224. The target is chosen as the ability is activated and the d20 rolled as it
// resolves (its ruling); the sacrificed artifact deals the damage as it last existed.
const TEXT =
  "{5}, {T}, Sacrifice this artifact: Choose target creature, then roll a d20.\n1—9 | This artifact deals 5 damage to that creature.\n10—20 | This artifact deals 5 damage to that creature. Create a Treasure token.";

export default defineCard({
  name: "Spiked Pit Trap",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{5}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: { kind: "damage", amount: 5, target: 0 } },
          {
            min: 10,
            max: 20,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "damage", amount: 5, target: 0 },
                { kind: "create-token", token: "Treasure Token", count: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
