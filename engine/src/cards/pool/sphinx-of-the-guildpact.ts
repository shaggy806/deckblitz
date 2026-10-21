import { defineCard } from "../define.js";

// Ravnica Allegiance. "Is all colors" is its printed colours, so it holds in
// every zone (the ruling). "Monocolored" is exactly one colour (Vanishing
// Verse's filter): not multicoloured and at least one colour, so a colourless
// source can target it (the ruling); read off the spell or source itself.
const HEXPROOF_TEXT =
  "Hexproof from monocolored (This creature can't be the target of monocolored spells or abilities your opponents control.)";

export default defineCard({
  name: "Sphinx of the Guildpact",
  manaCost: "{7}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["artifact", "creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Sphinx of the Guildpact is all colors.\nFlying\n${HEXPROOF_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      hexproofFrom: {
        filter: {
          multicolored: false,
          anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }, { colors: ["G"] }],
        },
      },
      text: HEXPROOF_TEXT,
    },
  ],
});
