import { defineCard } from "../define.js";

// Ravage, a legendary 3/3 black Robot artifact creature token (Soundwave,
// Superior Captain).

export default defineCard({
  name: "Ravage Token",
  art: "b3170b92-b4eb-4826-92ed-85deba4c4c88",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 3,
  toughness: 3,
  keywords: ["menace", "deathtouch"],
  text: "Menace, deathtouch",
});
