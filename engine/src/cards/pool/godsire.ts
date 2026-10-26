import { defineCard } from "../define.js";

// Shards of Alara (ALA). EDHREC rank 15672.
const TOKEN_TEXT = "{T}: Create an 8/8 Beast creature token that's red, green, and white.";

export default defineCard({
  name: "Godsire",
  manaCost: "{4}{R}{G}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 8,
  toughness: 8,
  keywords: ["vigilance"],
  text: `Vigilance\n${TOKEN_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "create-token", token: "8/8 Red Green White Beast Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
