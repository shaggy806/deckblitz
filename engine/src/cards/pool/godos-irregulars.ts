import { defineCard } from "../define.js";

// EDHREC rank 30108.

export default defineCard({
  name: "Godo's Irregulars",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
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
