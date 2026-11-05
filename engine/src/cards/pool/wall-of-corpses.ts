import { defineCard } from "../define.js";

// EDHREC rank 25271.

export default defineCard({
  name: "Wall of Corpses",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 2,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\n{B}, Sacrifice this creature: Destroy target creature this creature is blocking.",
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", blockingRelation: { relation: "blocked-by" } },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{B}, Sacrifice this creature: Destroy target creature this creature is blocking.",
    },
  ],
});
