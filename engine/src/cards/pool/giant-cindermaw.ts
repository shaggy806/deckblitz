import { defineCard } from "../define.js";

// EDHREC rank 10933.
//
// Rulings:
//   [2022-10-14] Spells and abilities that cause players to gain life still resolve while Giant
//     Cindermaw is on the battlefield. No player will gain life, but any other effects of that
//     spell or ability will happen.
//   [2022-10-14] If an effect says to set a player's life total to a number that's higher than the
//     player's current life total while Giant Cindermaw is on the battlefield, the player's life
//     total doesn't change.
//
// Rampaging Ferocidon's prevent over every player; a life total set higher goes through the
// same gain (`Game.changeLife`).

const LIFE_TEXT = "Players can't gain life.";

export default defineCard({
  name: "Giant Cindermaw",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Beast"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\n${LIFE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "any-player", prevent: true },
      text: LIFE_TEXT,
    },
  ],
});
