import { defineCard } from "../define.js";

export default defineCard({
  name: "Guardian of the Guildpact",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  text: "Protection from monocolored",
  static: [
    {
      affects: { scope: "self" },
      // Monocolored: exactly one colour (rule 105.4) — not colourless, not multicoloured.
      protection: { filter: { colorless: false, multicolored: false } },
      text: "Protection from monocolored",
    },
  ],
});
