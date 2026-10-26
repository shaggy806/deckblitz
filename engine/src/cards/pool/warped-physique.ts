import { defineCard } from "../define.js";

// Nightmarish End's shape: X is read once, as it resolves (its rulings), with
// Warped Physique itself already off the hand.
export default defineCard({
  name: "Warped Physique",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Target creature gets +X/-X until end of turn, where X is the number of cards in your hand.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { cardsInHand: "you" },
    toughness: { product: [{ cardsInHand: "you" }, -1] },
    duration: "end-of-turn",
  },
});
