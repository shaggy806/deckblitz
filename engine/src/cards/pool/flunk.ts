import { defineCard } from "../define.js";

// `as-player` so "you" in `cardsInHand` is that creature's controller; a P/T
// change has no controller that anything reads. X can't go below 0 (rule
// 107.1b), and `difference` doesn't: with seven or more cards it's -0/-0.

const X = { product: [{ difference: [7, { cardsInHand: "you" }] }, -1] } as const;

export default defineCard({
  name: "Flunk",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -X/-X until end of turn, where X is 7 minus the number of cards in that creature's controller's hand.",
  targets: ["creature"],
  effect: {
    kind: "as-player",
    who: { controllerOf: 0 },
    effect: { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
  },
});
