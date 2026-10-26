import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 25783.
//
// Rulings:
//   It looks back over the entire turn even if this card was not on the battlefield at the time.
//
// "One of their opponents" is every player but the one whose end step it is,
// and no condition names the active player's opponents, so the count is an
// amount: the players dealt damage this turn, less the active player if they
// were. The damage is 2 less 2 for each such opponent, never below 0 (rule
// 107.1b) — 2 when none was dealt damage, else 0, and a source dealing 0
// damage deals none at all (rule 120.8). Damage, not life loss: prevented
// damage isn't dealt. A player who lost the game this turn after being dealt
// damage still counts, as for Tymna's "opponents dealt damage this turn".

const TEXT =
  "At the beginning of each player's end step, this enchantment deals 2 damage to that player unless one of their opponents was dealt damage this turn.";

export default defineCard({
  name: "Antagonism",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "damage",
        who: "active-player",
        amount: {
          difference: [
            2,
            {
              product: [
                2,
                {
                  difference: [
                    { playersWithTurnStat: "damage-taken", who: "each-player" },
                    { playersWithTurnStat: "damage-taken", who: "active-player" },
                  ],
                },
              ],
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
