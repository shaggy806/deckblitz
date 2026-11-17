import { defineCard } from "../define.js";

// EDHREC rank 11728.
//
// Rulings:
//   This card knows how many were untapped even if it was not on the
//   battlefield at the beginning of the turn.
//
// "That player" is the player whose upkeep it is — the active player. The
// count is the untapped lands they controlled as the turn began, before its
// untap step untapped anything (`JournalTurn.began`).
const TEXT =
  "At the beginning of each player's upkeep, this enchantment deals X damage to that player, " +
  "where X is the number of untapped lands they controlled at the beginning of this turn.";

export default defineCard({
  name: "Power Surge",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "damage",
        who: "active-player",
        amount: { turnStat: "untapped-lands-as-turn-began", who: "active-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
