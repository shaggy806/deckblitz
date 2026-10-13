import { defineCard } from "../define.js";

// EDHREC rank 9431.
//
// Rulings:
//   [2024-09-20] If one of these lands is entering at the same time as a "shock land" (a cycle of
//     lands originally from Ravnica block that allow you to pay life or have them enter tapped),
//     use the life totals of all players before choices are made for that shock land's replacement
//     effect to determine whether or not the land enters tapped.

// "A player" is any player, you included. A shock land entering beside it
// pays its life only after both are on the battlefield, so the life totals
// read here are the ones from before that choice (the ruling).
const TAPPED_TEXT = "This land enters tapped unless a player has 13 or less life.";

export default defineCard({
  name: "Bleeding Woods",
  colors: [],
  types: ["land"],
  text: `${TAPPED_TEXT}\n{T}: Add {R} or {G}.`,
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
      text: TAPPED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {R} or {G}.",
    },
  ],
});
