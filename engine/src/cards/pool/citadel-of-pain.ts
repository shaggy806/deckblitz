import { defineCard } from "../define.js";

// EDHREC rank 6749.
//
// Rulings:
//   It counts the untapped lands on resolution.
//
// "That player" is the player whose end step it is — the active player
// (Kratos, God of War's shape); the count is read as the trigger resolves.
const TEXT =
  "At the beginning of each player's end step, this enchantment deals X damage to that player, " +
  "where X is the number of untapped lands they control.";

export default defineCard({
  name: "Citadel of Pain",
  manaCost: "{2}{R}",
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
        amount: { countOf: { type: "land", controlledBy: "active-player", tapped: false } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
