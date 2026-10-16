import { defineCard } from "../define.js";

// EDHREC rank 20912. Unlicensed Disintegration's shape: "that creature's
// controller" is the target's, read as last known.

export default defineCard({
  name: "Misthios's Fury",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Misthios's Fury deals 3 damage to target creature. If you control an Equipment, Misthios's Fury also deals 2 damage to that creature's controller.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Equipment" }, atLeast: 1 },
        then: { kind: "damage", amount: 2, toControllerOfTarget: 0 },
      },
    ],
  },
});
