import { defineCard } from "../define.js";

// EDHREC rank 7317.
//
// Rulings:
//   [2025-07-25] A player with ten or more poison counters loses the game. This is a state-based
//     action and doesn't use the stack. In other words, it happens immediately and players can't
//     respond to it, just like a player losing the game due to having 0 or less life.

const TEXT =
  "Whenever a nontoken artifact creature you control deals combat damage to a player, that player gets two poison counters.";

export default defineCard({
  name: "Virulent Silencer",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Assassin"],
  power: 2,
  toughness: 3,
  text: `${TEXT} (A player with ten or more poison counters loses the game.)`,
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { token: false, types: ["artifact", "creature"] },
      },
      targets: [],
      effect: { kind: "add-player-counters", counter: "poison", amount: 2, who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
