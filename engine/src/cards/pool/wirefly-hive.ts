import { defineCard } from "../define.js";

export default defineCard({
  name: "Wirefly Hive",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{3}, {T}: Flip a coin. If you win the flip, create a 2/2 colorless Insect artifact creature token with flying named Wirefly. If you lose the flip, destroy all permanents named Wirefly.",
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "flip-coin",
        won: { kind: "create-token", token: "Wirefly Token", count: 1 },
        lost: { kind: "destroy-all", filter: { name: "Wirefly" } },
      },
      resolve: null,
      text: "{3}, {T}: Flip a coin. If you win the flip, create a 2/2 colorless Insect artifact creature token with flying named Wirefly. If you lose the flip, destroy all permanents named Wirefly.",
    },
  ],
});
