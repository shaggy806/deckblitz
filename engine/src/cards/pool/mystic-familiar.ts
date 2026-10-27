import { defineCard } from "../define.js";

const TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+1 and has protection from black.";

export default defineCard({
  name: "Mystic Familiar",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      protection: { colors: ["B"] },
      text: TEXT,
    },
  ],
});
