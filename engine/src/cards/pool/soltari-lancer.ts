import { defineCard } from "../define.js";

// EDHREC rank 24139.

const FIRST_STRIKE_TEXT = "This creature has first strike as long as it's attacking.";

export default defineCard({
  name: "Soltari Lancer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Soltari", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${FIRST_STRIKE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantKeywords: ["first-strike"],
      text: FIRST_STRIKE_TEXT,
    },
  ],
});
