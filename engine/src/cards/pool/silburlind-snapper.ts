import { defineCard } from "../define.js";

// EDHREC rank 27823.
//
// Rulings:
//   [2016-04-08] It doesn't matter whether the noncreature spell resolved or was countered, as
//     long as it was cast.
// `cast-this-turn` counts spells as they were cast, whatever became of them.

const TEXT = "This creature can't attack unless you've cast a noncreature spell this turn.";

export default defineCard({
  name: "Silburlind Snapper",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Turtle"],
  power: 6,
  toughness: 6,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack"],
      condition: { kind: "not", of: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } } },
      text: TEXT,
    },
  ],
});
