import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 14145.
//
// Rulings:
//   [2014-02-01] If you put all permanents you control into one pile, you’ll have a two-thirds
//     chance of not having to sacrifice any permanents, but a one-third chance of having to
//     sacrifice all of them.
//   [2014-02-01] To choose a pile at random, each pile must have an equal chance of being chosen.
//     There are many ways to do this, including assigning each pile a number and rolling a die.
//   [2014-02-01] You may put Auras or Equipment into one pile and the creatures they were attached
//     to into a different pile.

export default defineCard({
  name: "Whims of the Fates",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Starting with you, each player separates all permanents they control into three piles. Then each player chooses one of their piles at random and sacrifices those permanents. (Piles can be empty.)",
  // TODO(scaffold): Starting with you, each player separates all permanents they control into three piles.
  // TODO(scaffold): Then each player chooses one of their piles at random and sacrifices those permanents.
});
