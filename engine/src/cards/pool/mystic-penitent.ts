import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 31116.

const THRESHOLD =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+1 and has flying.";

export default defineCard({
  name: "Mystic Penitent",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad", "Mystic"],
  power: 1,
  toughness: 1,
  keywords: ["vigilance"],
  text: `Vigilance\n${THRESHOLD}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      text: THRESHOLD,
    },
  ],
});
