import { defineCard } from "../define.js";

// Formless Genesis's X/X colorless Shapeshifter token: it prints 0/0 and gets
// its size from `create-token`'s `basePt` as it's made.
export default defineCard({
  name: "Shapeshifter Token (X/X Changeling Deathtouch)",
  art: "30f46500-172a-40ce-9f8e-3738e764e3fa",
  colors: [],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 0,
  keywords: ["changeling", "deathtouch"],
  text: "Changeling (This token is every creature type.)\nDeathtouch",
});
