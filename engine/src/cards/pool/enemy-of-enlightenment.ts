import { defineCard } from "../define.js";

// Born of the Gods. Every opponent's hand together scales it down.

const SHRINK = "This creature gets -1/-1 for each card in your opponents' hands.";
const UPKEEP = "At the beginning of your upkeep, each player discards a card.";

export default defineCard({
  name: "Enemy of Enlightenment",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${SHRINK}\n${UPKEEP}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { cardsInHand: "opponents", pt: [-1, -1] },
      text: SHRINK,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "discard", target: "each-player", amount: 1 },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
