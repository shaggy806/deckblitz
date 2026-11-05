import { defineCard } from "../define.js";

// EDHREC rank 22006.

export default defineCard({
  name: "Revelation",
  manaCost: "{G}",
  colors: ["G"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: "Players play with their hands revealed.",
  static: [
    {
      affects: { scope: "self" },
      visibility: { handsRevealed: "each-player" },
      text: "Players play with their hands revealed.",
    },
  ],
});
