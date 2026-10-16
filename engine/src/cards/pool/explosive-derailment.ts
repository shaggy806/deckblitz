import { defineCard } from "../define.js";

// EDHREC rank 12373.
//
// Spree (rule 702.172a): one or both modes, each with its additional cost,
// followed in printed order.
export default defineCard({
  name: "Explosive Derailment",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "Spree (Choose one or more additional costs.)\n" +
    "+ {2} — Explosive Derailment deals 4 damage to target creature.\n" +
    "+ {2} — Destroy target artifact.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "+ {2} — Explosive Derailment deals 4 damage to target creature.",
        spreeCost: "{2}",
        targets: ["creature"],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
      {
        text: "+ {2} — Destroy target artifact.",
        spreeCost: "{2}",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
