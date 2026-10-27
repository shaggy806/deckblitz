import { defineCard } from "../define.js";

// EDHREC rank 13514.
//
// Rulings:
//   [2004-10-04] To win, you must control 20 or more creatures both at the beginning of upkeep and
//     when it resolves.
//
// Hellkite Tyrant's upkeep ability: an intervening-if (rule 603.4), checked as
// the upkeep begins and again as it resolves (the ruling). A token stack counts
// as every token in it.

const TEXT = "At the beginning of your upkeep, if you control twenty or more creatures, you win the game.";

export default defineCard({
  name: "Epic Struggle",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "controls", filter: { type: "creature" }, atLeast: 20 },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: TEXT,
    },
  ],
});
