import { defineCard } from "../define.js";

export default defineCard({
  name: "Deadly Riposte",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Deadly Riposte deals 3 damage to target tapped creature and you gain 2 life.",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 3, target: 0 }, { kind: "gain-life", amount: 2 }],
  },
});
