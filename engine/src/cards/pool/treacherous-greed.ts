import { defineCard } from "../define.js";

// "A creature that dealt damage this turn" — to anything (its ruling), the
// `dealtDamageThisTurn: true` clause.
export default defineCard({
  name: "Treacherous Greed",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice a creature that dealt damage this turn.\nDraw three cards. Each opponent loses 3 life and you gain 3 life.",
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you", dealtDamageThisTurn: true } },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "lose-life", amount: 3, who: "each-opponent" },
      { kind: "gain-life", amount: 3 },
    ],
  },
});
