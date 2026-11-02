import { defineCard } from "../define.js";

export default defineCard({
  name: "Lantern of Insight",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "Players play with the top card of their libraries revealed.\n{T}, Sacrifice this artifact: Target player shuffles.",
  static: [{ affects: { scope: "self" }, visibility: { libraryTopRevealed: "each-player" }, text: "Players play with the top card of their libraries revealed." }],
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["player"],
      effect: { kind: "shuffle-library", target: 0 },
      resolve: null,
      text: "{T}, Sacrifice this artifact: Target player shuffles.",
    },
  ],
});
