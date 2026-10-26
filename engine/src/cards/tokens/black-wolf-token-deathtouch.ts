import { defineCard } from "../define.js";

// A 1/1 black Wolf creature token with deathtouch (Garruk, the Veil-Cursed).

export default defineCard({
  name: "Black Wolf Token (Deathtouch)",
  art: "f5561f57-34e2-4c01-8094-0ecb101c7fa1",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: "Deathtouch",
});
