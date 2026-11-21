import { defineCard } from "../define.js";

// EDHREC rank 18922.
//
// The "if there are no omen counters" is no intervening if (it isn't right
// after the trigger condition, rule 603.4): the trigger always happens and the
// check is made as it resolves, after the counter is removed. "The player with
// the highest life total" is the one player still in the game with more life
// than each other (`win-game`'s `who`); two or more tied for it and the game is
// a draw (rule 104.4c — `game-is-a-draw`). A player who can't win the game
// (Platinum Angel's opponents) stops only their own win.
const UPKEEP =
  "At the beginning of your upkeep, remove an omen counter from this enchantment. If there are no omen counters on this enchantment, the player with the highest life total wins the game. If two or more players are tied for highest life total, the game is a draw.";

export default defineCard({
  name: "Celestial Convergence",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `This enchantment enters with seven omen counters on it.\n${UPKEEP}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "omen", amount: 7 } },
      text: "This enchantment enters with seven omen counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: "source", counter: "omen", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "omen", compare: { op: "eq", n: 0 } },
            then: {
              kind: "win-game",
              who: { greatest: { lifeTotal: "each" } },
              ifTied: { kind: "game-is-a-draw" },
            },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
