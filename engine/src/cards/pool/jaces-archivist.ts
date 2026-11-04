import { defineCard } from "../define.js";

// EDHREC rank 1906. Windfall on a creature.
//
// Rulings:
//   If this ability causes a player to draw more cards than are left in their library, that player
//   loses the game as a state-based action. If this ability causes all players to do this, the
//   game is a draw.
const TEXT =
  "{U}, {T}: Each player discards their hand, then draws cards equal to the greatest number of cards a player discarded this way.";

export default defineCard({
  name: "Jace's Archivist",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "each-player" },
          { kind: "draw", who: "each-player", amount: { thisWay: "discarded", perPlayer: "greatest" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
