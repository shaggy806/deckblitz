import { demonstrate } from "../helpers.js";
import { defineCard } from "../define.js";

// Commander 2021 (C21). Stroke of Midnight's shape: the Treasures go to the
// destroyed permanent's controller, made even if it survives (indestructible).
const TEXT = "Destroy target nonland permanent. Its controller creates two Treasure tokens.";

export default defineCard({
  name: "Excavation Technique",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `Demonstrate (When you cast this spell, you may copy it. If you do, choose an opponent to also copy it. Players may choose new targets for their copies.)\n${TEXT}`,
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "create-token", token: "Treasure Token", count: 2, who: "target-controller" },
    ],
  },
  triggered: [demonstrate()],
});
