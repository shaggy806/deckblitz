import { defineCard } from "../define.js";

export default defineCard({
  name: "Eriette's Lullaby",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy target tapped creature. You gain 2 life.",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "gain-life", amount: 2 }],
  },
});
