import { defineCard } from "../define.js";

/** 3/3 blue and red Elemental with flying — Secrets of Strixhaven's (Muse's
 * Encouragement, Campus Composer's Aqueous Aria). */
export default defineCard({
  name: "Elemental Token (3/3 Blue-Red Flying)",
  art: "b5b2df9c-228f-4441-a962-46b335bb356e",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying",
});
