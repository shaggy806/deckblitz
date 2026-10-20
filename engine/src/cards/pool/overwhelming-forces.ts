import { defineCard } from "../define.js";

// "Destroyed this way" counts only those actually destroyed — not an
// indestructible or regenerated one.
export default defineCard({
  name: "Overwhelming Forces",
  manaCost: "{6}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all creatures target opponent controls. Draw a card for each creature destroyed this way.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0 },
      { kind: "draw", amount: { thisWay: "destroyed" } },
    ],
  },
});
