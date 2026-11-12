import { defineCard } from "../define.js";

// Laserbeak, a legendary 2/2 blue Robot artifact creature token (Soundwave,
// Superior Captain).

export default defineCard({
  name: "Laserbeak Token",
  art: "47b48ea5-a12f-4a3b-b7d9-2124e43d8833",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "hexproof"],
  text: "Flying, hexproof",
});
