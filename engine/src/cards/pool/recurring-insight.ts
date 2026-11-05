import { defineCard } from "../define.js";

export default defineCard({
  name: "Recurring Insight",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  rebound: true,
  text: "Draw cards equal to the number of cards in target opponent's hand.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: ["opponent"],
  effect: { kind: "draw", amount: { cardsInHand: { target: 0 } } },
});
