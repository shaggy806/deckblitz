import { defineCard } from "../define.js";

// Rulings:
//   No player may take any action in between the two steps of Fevered Visions's triggered ability,
//     so if your opponent has four or more cards in hand after drawing a card, Fevered Visions will
//     deal 2 damage to that player.
//
// The player whose end step it is is your opponent exactly when it isn't your turn.

const TEXT =
  "At the beginning of each player's end step, that player draws a card. If the player is your opponent and has four or more cards in hand, this enchantment deals 2 damage to that player.";

export default defineCard({
  name: "Fevered Visions",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1, who: "active-player" },
          {
            kind: "conditional",
            condition: {
              kind: "all",
              of: [
                { kind: "not", of: { kind: "your-turn" } },
                { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atLeast: 4 } },
              ],
            },
            then: { kind: "damage", amount: 2, who: "active-player" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
