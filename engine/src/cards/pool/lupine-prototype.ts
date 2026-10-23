import { defineCard } from "../define.js";

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
      // "Unless a player has no cards in hand" — restricted while every
      // player still in the game has at least one card in hand.
      condition: { kind: "hand-size", atLeast: 1, who: "each-player" },
      restrictions: ["cant-attack", "cant-block"],
      text: "This creature can't attack or block unless a player has no cards in hand.",
    },
  ],
});
