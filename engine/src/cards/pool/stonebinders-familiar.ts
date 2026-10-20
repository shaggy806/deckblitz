import { defineCard } from "../define.js";

// Rulings:
//   [2021-04-16] If multiple cards are put into exile as part of the same event on your turn, the
//     triggered ability will trigger only once.
//
// Any player's cards, from anywhere (tokens aren't cards); "during your turn"
// is part of the trigger condition, not an intervening "if".

const TEXT =
  "Whenever one or more cards are put into exile during your turn, put a +1/+1 counter on this creature. This ability triggers only once each turn.";

export default defineCard({
  name: "Stonebinder's Familiar",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Dog"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "put-into-exile", who: "any" },
      whileCondition: { kind: "your-turn" },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
