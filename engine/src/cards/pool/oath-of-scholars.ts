import { defineCard } from "../define.js";

// Rulings:
//   Being compared is part of the targeting requirement: a player can't be targeted unless it's
//     true, and the ability doesn't resolve if it's no longer true at that time.
//   The ability can only target an opponent of the current player.
// The Oath's controller controls the ability (its controller can be the target, and hexproof reads
// that player), and the active player chooses the target as it goes on the stack and answers the
// "may" (`each-player-may`, where "you" is them).
const TEXT =
  "At the beginning of each player's upkeep, that player chooses target player who has more cards in hand than they do and is their opponent. The first player may discard their hand and draw three cards.";

export default defineCard({
  name: "Oath of Scholars",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targetsChosenBy: "active-player",
      targets: [{ kind: "opponent-compared", stat: "cards-in-hand", by: 1, comparedTo: "active-player" }],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Discard your hand and draw three cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard-hand", who: "you" },
            { kind: "draw", amount: 3 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
