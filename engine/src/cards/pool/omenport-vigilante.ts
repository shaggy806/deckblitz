import { defineCard } from "../define.js";

// EDHREC rank 25389.
const TEXT = "This creature has double strike as long as you've committed a crime this turn.";

export default defineCard({
  name: "Omenport Vigilante",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 2,
  toughness: 2,
  text: `${TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "committed-crime-this-turn" },
      grantKeywords: ["double-strike"],
      text: TEXT,
    },
  ],
});
