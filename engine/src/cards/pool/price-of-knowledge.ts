import { defineCard } from "../define.js";

const UPKEEP =
  "At the beginning of each opponent's upkeep, this enchantment deals damage to that player equal to the number of cards in that player's hand.";

export default defineCard({
  name: "Price of Knowledge",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `Players have no maximum hand size.\n${UPKEEP}`,
  static: [{ affects: { scope: "self" }, noMaxHandSize: "each-player", text: "Players have no maximum hand size." }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: { kind: "damage", amount: { cardsInHand: "active-player" }, who: "active-player" },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
