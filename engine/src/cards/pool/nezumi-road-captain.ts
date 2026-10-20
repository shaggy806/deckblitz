import { defineCard } from "../define.js";

// Okiba Reckoner Raid's back face. Mu Yanling, Wind Rider's Vehicle grant.

const GRANT_TEXT = "Vehicles you control have menace.";

export default defineCard({
  name: "Nezumi Road Captain",
  art: "https://cards.scryfall.io/art_crop/back/4/f/4f0582b4-d951-4450-b158-4a34109e48cd.jpg",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Rat", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${GRANT_TEXT} (They can't be blocked except by two or more creatures.)`,
  faces: ["Okiba Reckoner Raid", "Nezumi Road Captain"],
  transform: true,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Vehicle", controlledBy: "you" } },
      grantKeywords: ["menace"],
      text: GRANT_TEXT,
    },
  ],
});
