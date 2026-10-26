import { defineCard } from "../define.js";

// EDHREC rank 29349.

export default defineCard({
  name: "Mind Peel",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  kicker: { cost: "{2}{B}{B}", keyword: "buyback" },
  text: "Buyback {2}{B}{B} (You may pay an additional {2}{B}{B} as you cast this spell. If you do, put this card into your hand as it resolves.)\nTarget player discards a card.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 1 },
});
