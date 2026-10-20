import { defineCard } from "../define.js";

const WOLF_TEXT = "{2}{R}, {T}, Exile three cards from your graveyard: Create a 3/2 red Wolf creature token.";

export default defineCard({
  name: "Kessig Wolfrider",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${WOLF_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true, exileFromGraveyard: { count: 3 } },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token (Kessig Wolfrider)", count: 1 },
      resolve: null,
      text: WOLF_TEXT,
    },
  ],
});
