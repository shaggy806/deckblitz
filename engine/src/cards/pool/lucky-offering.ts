import { defineCard } from "../define.js";

export default defineCard({
  name: "Lucky Offering",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy target artifact with mana value 3 or less. You gain 3 life.",
  targets: [{ kind: "permanent", filter: { type: "artifact", manaValue: { op: "lte", n: 3 } } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "gain-life", amount: 3 }],
  },
});
