import { defineCard } from "../define.js";

// EDHREC rank 28805.

const RETURN_TEXT = "{2}{W/B}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Blessed Ghoul",
  manaCost: "{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Zombie", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{W/B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
