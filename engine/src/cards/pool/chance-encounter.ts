import { defineCard } from "../define.js";

// EDHREC rank 6816.
//
// Rulings:
//   You can only win a coin flip if you are the player flipping the coin. Your opponent losing
//     a flip does not count as you winning one.
//
// Tavern Scoundrel's `wins-coin-flip` (yours alone, the ruling) and Simic
// Ascendancy's upkeep win: an intervening-if (rule 603.4) on ten luck
// counters, as the upkeep begins and again as it resolves.

const LUCK = "Whenever you win a coin flip, put a luck counter on this enchantment.";
const WIN =
  "At the beginning of your upkeep, if this enchantment has ten or more luck counters on it, you win the game.";

export default defineCard({
  name: "Chance Encounter",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${LUCK}\n${WIN}`,
  triggered: [
    {
      trigger: { on: "wins-coin-flip", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "luck", amount: 1 },
      resolve: null,
      text: LUCK,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "self-counters", counter: "luck", compare: { op: "gte", n: 10 } },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: WIN,
    },
  ],
});
