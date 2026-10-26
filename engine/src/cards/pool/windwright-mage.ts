import { defineCard } from "../define.js";

// EDHREC rank 28399. Shards of Alara.
const TEXT = "This creature has flying as long as an artifact card is in your graveyard.";

export default defineCard({
  name: "Windwright Mage",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink (Damage dealt by this creature also causes you to gain that much life.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "artifact" } },
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
