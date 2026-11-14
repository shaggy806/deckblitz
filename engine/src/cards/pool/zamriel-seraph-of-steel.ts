import { defineCard } from "../define.js";

// EDHREC rank 17633.
const STATIC_TEXT = "During your turn, equipped creatures you control have indestructible.";

export default defineCard({
  name: "Zamriel, Seraph of Steel",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${STATIC_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", equipped: true } },
      condition: { kind: "your-turn" },
      grantKeywords: ["indestructible"],
      text: STATIC_TEXT,
    },
  ],
});
