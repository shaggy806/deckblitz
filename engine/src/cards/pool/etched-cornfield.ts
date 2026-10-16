import { defineCard } from "../define.js";

// EDHREC rank 10649. Abandoned Campground's cycle.
//
// Rulings:
//   [2024-09-20] If one of these lands is entering at the same time as a "shock land" (a cycle of
//     lands originally from Ravnica block that allow you to pay life or have them enter tapped),
//     use the life totals of all players before choices are made for that shock land's replacement
//     effect to determine whether or not the land enters tapped.

export default defineCard({
  name: "Etched Cornfield",
  colors: [],
  types: ["land"],
  text: "This land enters tapped unless a player has 13 or less life.\n{T}: Add {G} or {W}.",
  // "A player" is any player in the game, you included, read as it enters.
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
      effect: { kind: "add-mana", mana: { oneOf: ["G", "W"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {G} or {W}.",
    },
  ],
});
