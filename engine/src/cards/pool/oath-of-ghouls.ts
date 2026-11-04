import { defineCard } from "../define.js";

// Rulings:
//   Being compared is part of the targeting requirement: a player can't be targeted unless it's
//     true, and the ability doesn't resolve if it's no longer true at that time.
//   The ability can only target an opponent of the current player.
// The Oath's controller controls the ability (its controller can be the target, and hexproof reads
// that player), and the active player chooses the target as it goes on the stack and answers the
// "may" (`each-player-may`, where "you" is them).
const TEXT =
  "At the beginning of each player's upkeep, that player chooses target player whose graveyard has fewer creature cards in it than their graveyard does and is their opponent. The first player may return a creature card from their graveyard to their hand.";

export default defineCard({
  name: "Oath of Ghouls",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targetsChosenBy: "active-player",
      targets: [{ kind: "opponent-compared", stat: "creature-cards-in-graveyard", by: -1, comparedTo: "active-player" }],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Return a creature card from your graveyard to your hand?",
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "stay",
          filter: { type: "creature" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
