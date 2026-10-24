import { defineCard } from "../define.js";

export default defineCard({
  name: "Alms of the Vein",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  madness: { cost: "{B}" },
  text: "Target opponent loses 3 life and you gain 3 life.\nMadness {B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "lose-life", amount: 3, target: 0 }, { kind: "gain-life", amount: 3 }],
  },
});
