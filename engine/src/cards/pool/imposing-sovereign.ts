import { defineCard } from "../define.js";

// EDHREC rank 12466.

const TEXT = "Creatures your opponents control enter tapped.";

export default defineCard({
  name: "Imposing Sovereign",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "opponent" },
        tapped: true,
      },
      text: TEXT,
    },
  ],
});
