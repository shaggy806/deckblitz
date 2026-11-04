import { defineCard } from "../define.js";

// Rulings:
//   Being compared is part of the targeting requirement: a player can't be targeted unless it's
//     true, and the ability doesn't resolve if it's no longer true at that time.
//   The ability can only target an opponent of the current player.
// The Oath's controller controls the ability (its controller can be the target, and hexproof reads
// that player), and the active player chooses the target as it goes on the stack and answers the
// "may" (`each-player-may`, where "you" is them).
const TEXT =
  "At the beginning of each player's upkeep, that player chooses target player who controls more creatures than they do and is their opponent. The first player may reveal cards from the top of their library until they reveal a creature card. If the first player does, that player puts that card onto the battlefield and all other cards revealed this way into their graveyard.";

export default defineCard({
  name: "Oath of Druids",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targetsChosenBy: "active-player",
      targets: [{ kind: "opponent-compared", stat: "creatures", by: 1, comparedTo: "active-player" }],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Reveal cards from the top of your library until you reveal a creature card?",
        effect: { kind: "reveal-until", filter: { type: "creature" }, put: "battlefield", rest: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
