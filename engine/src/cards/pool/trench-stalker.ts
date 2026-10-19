import { defineCard } from "../define.js";

// EDHREC rank 28489.
//
// Rulings:
//   [2022-10-14] Trench Stalker doesn't need to have been on the battlefield when you drew the
//     cards. If you draw two cards, then play Trench Stalker, it has deathtouch and lifelink this
//     turn.
//
// The turn's draws are counted for the player, not the creature (the ruling).
const TEXT = "As long as you've drawn two or more cards this turn, this creature has deathtouch and lifelink.";

export default defineCard({
  name: "Trench Stalker",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast", "Horror"],
  power: 4,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 2 },
      grantKeywords: ["deathtouch", "lifelink"],
      text: TEXT,
    },
  ],
});
