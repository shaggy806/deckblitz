import { defineCard } from "../define.js";

// EDHREC rank 12056. A replacement (rule 614.1c): they enter tapped, never
// untapped and then tapped (the ruling).

export default defineCard({
  name: "Kismet",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Artifacts, creatures, and lands your opponents control enter tapped.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { typesAnyOf: ["artifact", "creature", "land"], controlledBy: "opponent" },
        tapped: true,
      },
      text: "Artifacts, creatures, and lands your opponents control enter tapped.",
    },
  ],
});
