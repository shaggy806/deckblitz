import { defineCard } from "../define.js";

// Rulings:
//   Being compared is part of the targeting requirement: a player can't be targeted unless it's
//     true, and the ability doesn't resolve if it's no longer true at that time.
//   The ability can only target an opponent of the current player.
//   The land card enters under the current player's control.
//   Shuffling the library is part of the optional effect. The player only shuffles if they chose to
//     search.
// The Oath's controller controls the ability (its controller can be the target, and hexproof reads
// that player), and the active player chooses the target as it goes on the stack and answers the
// "may" (`each-player-may`, where "you" is them).
const TEXT =
  "At the beginning of each player's upkeep, that player chooses target player who controls more lands than they do and is their opponent. The first player may search their library for a basic land card, put that card onto the battlefield, then shuffle.";

export default defineCard({
  name: "Oath of Lieges",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targetsChosenBy: "active-player",
      targets: [{ kind: "opponent-compared", stat: "lands", by: 1, comparedTo: "active-player" }],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
