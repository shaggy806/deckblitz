import { defineCard } from "../define.js";

// EDHREC rank 32195.

export default defineCard({
  name: "Flowstone Salamander",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Salamander"],
  power: 3,
  toughness: 4,
  text: "{R}: This creature deals 1 damage to target creature blocking it.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", blockingRelation: { relation: "blocking" } },
        },
      ],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{R}: This creature deals 1 damage to target creature blocking it.",
    },
  ],
});
