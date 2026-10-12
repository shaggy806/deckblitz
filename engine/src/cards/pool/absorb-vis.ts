import { defineCard } from "../define.js";

export default defineCard({
  name: "Absorb Vis",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["sorcery"],
  cycling: { cost: "{1}{B}", search: { supertype: "basic", type: "land" } },
  text: "Target player loses 4 life and you gain 4 life.\nBasic landcycling {1}{B} ({1}{B}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "lose-life", amount: 4, target: 0 }, { kind: "gain-life", amount: 4 }],
  },
});
