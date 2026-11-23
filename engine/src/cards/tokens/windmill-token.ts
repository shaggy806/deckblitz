import { defineCard } from "../define.js";

// Windmill Slam's 4/4 colorless Windmill artifact creature with defender: no
// token printing on Scryfall or in the Oracle snapshot.
export default defineCard({
  name: "Windmill Token",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Windmill"],
  power: 4,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender",
});
