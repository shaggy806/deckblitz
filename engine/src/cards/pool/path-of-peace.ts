import { defineCard } from "../define.js";

export default defineCard({
  name: "Path of Peace",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy target creature. Its owner gains 4 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: 4, who: { ownerOfTarget: 0 } },
    ],
  },
});
