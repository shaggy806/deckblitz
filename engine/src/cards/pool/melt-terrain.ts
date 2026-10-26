import { defineCard } from "../define.js";

// EDHREC rank 24004. Poison the Well's shape.

export default defineCard({
  name: "Melt Terrain",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target land. Melt Terrain deals 2 damage to that land's controller.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "damage", amount: 2, toControllerOfTarget: 0 },
    ],
  },
});
