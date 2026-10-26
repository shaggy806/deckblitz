import { defineCard } from "../define.js";

// EDHREC rank 23125.
//
// Rulings:
//   [2004-10-04] If a spell is countered, it still counts as having been cast.
//
// "That player" is the player whose end step it is: the intervening-if counts
// the spells cast this turn whose caster is the active player
// (`controlledBy: "active-player"`, read off each spell as it was cast —
// Predatory Advantage's shape), so a spell another player cast doesn't save
// them. Checked as the end step begins and again on resolution (rule 603.4).
const TEXT =
  "At the beginning of each player's end step, if that player didn't cast a spell this turn, this enchantment deals 2 damage to that player.";

export default defineCard({
  name: "Impatience",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: {
        kind: "not",
        of: { kind: "cast-this-turn", who: "any", filter: { controlledBy: "active-player" } },
      },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
