import { defineCard } from "../define.js";

// A 0/4 colorless Wall artifact creature token with defender (The Birth of
// Meletis).

export default defineCard({
  name: "Wall Token (artifact, defender)",
  art: "dbdd5d53-65e7-42c3-a325-791f11335e62",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender",
});
