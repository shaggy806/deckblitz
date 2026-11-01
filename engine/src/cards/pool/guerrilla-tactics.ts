import { defineCard } from "../define.js";

// EDHREC rank 28376. Its discard trigger works from the graveyard (rule
// 113.6k), only for a discard an opponent's spell or ability caused; the
// card in the graveyard deals the damage.

const DISCARD = "When a spell or ability an opponent controls causes you to discard Guerrilla Tactics, Guerrilla Tactics deals 4 damage to any target.";

export default defineCard({
  name: "Guerrilla Tactics",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Guerrilla Tactics deals 2 damage to any target.\n${DISCARD}`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
  triggered: [
    {
      trigger: { on: "this-discarded", byOpponent: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: DISCARD,
    },
  ],
});
