import { defineCard } from "../define.js";

// Planar Chaos (PLC). Kismet's replacement: they enter tapped, never tapping
// after (the ruling), whoever puts them onto the battlefield.
const TEXT = "Artifacts, creatures, and lands your opponents control enter tapped.";

export default defineCard({
  name: "Frozen Aether",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { typesAnyOf: ["artifact", "creature", "land"], controlledBy: "opponent" },
        tapped: true,
      },
      text: TEXT,
    },
  ],
});
