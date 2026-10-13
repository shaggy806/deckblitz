import { defineCard } from "../define.js";

// EDHREC rank 8462.

export default defineCard({
  name: "Raucous Carnival",
  colors: [],
  types: ["land"],
  text: "This land enters tapped unless a player has 13 or less life.\n{T}: Add {R} or {W}.",
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
      effect: { kind: "add-mana", mana: { oneOf: ["R", "W"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {R} or {W}.",
    },
  ],
});
