import { defineCard } from "../define.js";

// EDHREC rank 10974.

export default defineCard({
  name: "Root Maze",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Artifacts and lands enter tapped.",
  static: [
    {
      // Every player's artifacts and lands (False Floor's shape).
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { typesAnyOf: ["artifact", "land"] },
        tapped: true,
      },
      text: "Artifacts and lands enter tapped.",
    },
  ],
});
