import { defineCard } from "../define.js";

// EDHREC rank 28762.

export default defineCard({
  name: "Brush with Death",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  kicker: { cost: "{2}{B}{B}", keyword: "buyback" },
  text: "Buyback {2}{B}{B} (You may pay an additional {2}{B}{B} as you cast this spell. If you do, put this card into your hand as it resolves.)\nTarget opponent loses 2 life. You gain 2 life.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "lose-life", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
  },
});
