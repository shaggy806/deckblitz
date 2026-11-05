import { defineCard } from "../define.js";

// EDHREC rank 17647.

export default defineCard({
  name: "Field of Dreams",
  manaCost: "{U}",
  colors: ["U"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: "Players play with the top card of their libraries revealed.",
  static: [
    {
      affects: { scope: "self" },
      visibility: { libraryTopRevealed: "each-player" },
      text: "Players play with the top card of their libraries revealed.",
    },
  ],
});
