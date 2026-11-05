import { defineCard } from "../define.js";

// EDHREC rank 24623.

export default defineCard({
  name: "Knight of Dusk",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: "{B}{B}: Destroy target creature blocking this creature.",
  activated: [
    {
      cost: { mana: "{B}{B}", tap: false },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", blockingRelation: { relation: "blocking" } },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{B}{B}: Destroy target creature blocking this creature.",
    },
  ],
});
