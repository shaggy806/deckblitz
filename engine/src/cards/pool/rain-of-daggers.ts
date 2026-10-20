import { defineCard } from "../define.js";

// "Destroyed this way" counts only those actually destroyed — not an
// indestructible or regenerated one.
export default defineCard({
  name: "Rain of Daggers",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all creatures target opponent controls. You lose 2 life for each creature destroyed this way.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0 },
      { kind: "lose-life", amount: { product: [{ thisWay: "destroyed" }, 2] } },
    ],
  },
});
