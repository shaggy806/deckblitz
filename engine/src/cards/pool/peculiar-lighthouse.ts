import { defineCard } from "../define.js";

// EDHREC rank 8568.
//
// Rulings:
//   [2024-09-20] If one of these lands is entering at the same time as a "shock land" (a cycle of
//     lands originally from Ravnica block that allow you to pay life or have them enter tapped),
//     use the life totals of all players before choices are made for that shock land's replacement
//     effect to determine whether or not the land enters tapped. For example, if a Lakeside Shack
//     and a Breeding Pool you control are entering at the same time (perhaps because of the effect
//     of a spell like Scapeshift), your life total is 14, and your opponent's life total is 20,
//     the Lakeside Shack will enter tapped whether or not you choose to pay life as Breeding Pool
//     enters.

export default defineCard({
  name: "Peculiar Lighthouse",
  colors: [],
  types: ["land"],
  text: "This land enters tapped unless a player has 13 or less life.\n{T}: Add {U} or {R}.",
  // "A player" is any player in the game, you included: a life total of 13
  // or less, yours or an opponent's, read as it enters (rule 614.12).
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: {
          kind: "any",
          of: [
            { kind: "life-total", who: "you", atMost: 13 },
            { kind: "life-total", who: "opponent", atMost: 13 },
          ],
        },
      },
      text: "This land enters tapped unless a player has 13 or less life.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["U", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {U} or {R}.",
    },
  ],
});
