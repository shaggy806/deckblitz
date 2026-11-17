import { defineCard } from "../define.js";

// The hand is counted as the turn began, before its draw step
// (`JournalTurn.began`): a card drawn since doesn't count.
const TEXT =
  "At the beginning of your upkeep, draw a card if you had no cards in hand at the beginning of this turn. " +
  "If you had a card in hand, this artifact deals 1 damage to you.";

export default defineCard({
  name: "Mindstorm Crown",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "amounts",
          left: { turnStat: "cards-in-hand-as-turn-began", who: "you" },
          op: "eq",
          right: 0,
        },
        then: { kind: "draw", amount: 1 },
        else: { kind: "damage", who: "you", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
