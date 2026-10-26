import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 9087.
//
// Consuming Corruption's shape on a creature-only target. An illegal target
// at resolution counters the whole spell, so no life is gained (the ruling).
const SWAMPS = { countOf: { subtype: "Swamp", controlledBy: "you" } } as const;

export default defineCard({
  name: "Tendrils of Corruption",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Tendrils of Corruption deals X damage to target creature and you gain X life, where X is the number of Swamps you control.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", target: 0, amount: SWAMPS },
      { kind: "gain-life", amount: SWAMPS },
    ],
  },
});
