import { defineCard } from "../define.js";

// EDHREC rank 2951.

export default defineCard({
  name: "Spikefield Hazard",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Spikefield Hazard deals 1 damage to any target. If a permanent dealt damage this way would die this turn, exile it instead.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "permanent" },
    ],
  },
  faces: ["Spikefield Hazard", "Spikefield Cave"],
});
