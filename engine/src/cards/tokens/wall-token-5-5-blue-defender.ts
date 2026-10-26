import { defineCard } from "../define.js";

// A 5/5 blue Wall creature token with defender (Tidal Wave).

export default defineCard({
  name: "Wall Token (5/5 blue, defender)",
  art: "353aaec9-79fb-4b83-b4f4-8c7dc2a6b1c1",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 5,
  toughness: 5,
  keywords: ["defender"],
  text: "Defender",
});
