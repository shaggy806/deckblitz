import { defineCard } from "../define.js";

// EDHREC rank 25050.
//
// Rulings:
//   An intervening "if" (rule 603.4): checked as the end step begins and
//     again on resolution.
//   It asks whether that player cast a creature spell — a countered one
//     counts — not whether a creature entered.
//
// "That player" is the opponent whose end step it is: the creature spells
// counted are every player's whose caster is the active player
// (`controlledBy: "active-player"` read off each spell as it was cast), so a
// creature another opponent flashed in that turn doesn't stop the token.

const TEXT =
  "At the beginning of each opponent's end step, if that player didn't cast a creature spell this turn, create a 2/2 green Lizard creature token.";

export default defineCard({
  name: "Predatory Advantage",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "opponent" },
      condition: {
        kind: "not",
        of: { kind: "cast-this-turn", who: "any", filter: { type: "creature", controlledBy: "active-player" } },
      },
      targets: [],
      effect: { kind: "create-token", token: "2/2 Green Lizard Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
