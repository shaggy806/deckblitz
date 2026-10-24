import { defineCard } from "../define.js";

// EDHREC rank 7956.
//
// Rulings:
//   [2012-07-01] In a multiplayer game, a single opponent must have ten or more cards in their
//     graveyard for the bonus to apply, although this opponent may change over the course of the
//     game.
//   [2012-07-01] The last ability of Jace's Phantasm constantly monitors each opponent's
//     graveyard to see if the bonus applies.

const PUMP_TEXT = "This creature gets +4/+4 as long as an opponent has ten or more cards in their graveyard.";

export default defineCard({
  name: "Jace's Phantasm",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 10 },
      grantPt: [4, 4],
      text: PUMP_TEXT,
    },
  ],
});
