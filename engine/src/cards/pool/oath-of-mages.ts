import { defineCard } from "../define.js";

// Rulings:
//   Being compared is part of the targeting requirement: a player can't be targeted unless it's
//     true, and the ability doesn't resolve if it's no longer true at that time.
//   The ability can only target an opponent of the current player.
// The Oath's controller controls the ability (its controller can be the target, and hexproof reads
// that player), and the active player chooses the target as it goes on the stack and answers the
// "may" (`each-player-may`, where "you" is them).
const TEXT =
  "At the beginning of each player's upkeep, that player chooses target player who has more life than they do and is their opponent. The first player may have this enchantment deal 1 damage to the second player.";

export default defineCard({
  name: "Oath of Mages",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targetsChosenBy: "active-player",
      targets: [{ kind: "opponent-compared", stat: "life", by: 1, comparedTo: "active-player" }],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Have this enchantment deal 1 damage to the second player?",
        effect: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
