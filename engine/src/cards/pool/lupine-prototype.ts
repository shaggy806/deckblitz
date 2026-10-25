import { defineCard } from "../define.js";

// EDHREC rank 9109.
//
// "Unless a player has no cards in hand": the restriction holds while every
// player still in the game has at least one card in hand. It's read as
// attackers and blockers are declared (the first ruling).

export default defineCard({
  name: "Lupine Prototype",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wolf", "Construct"],
  power: 5,
  toughness: 5,
  text: "This creature can't attack or block unless a player has no cards in hand.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", who: "each-player", atLeast: 1 },
      restrictions: ["cant-attack", "cant-block"],
      text: "This creature can't attack or block unless a player has no cards in hand.",
    },
  ],
});
