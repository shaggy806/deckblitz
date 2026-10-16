import { defineCard } from "../define.js";

const TEXT = "This creature gets +2/+0 as long as you've committed a crime this turn.";

export default defineCard({
  name: "Slickshot Vault-Buster",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "committed-crime-this-turn" },
      grantPt: [2, 0],
      text: TEXT,
    },
  ],
});
