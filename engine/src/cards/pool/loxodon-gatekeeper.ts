import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 12392. Kismet's replacement.
const TEXT = "Artifacts, creatures, and lands your opponents control enter tapped.";

export default defineCard({
  name: "Loxodon Gatekeeper",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Soldier"],
  power: 2,
  toughness: 3,
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
