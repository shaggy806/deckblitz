import { defineCard } from "../define.js";

/**
 * Tolsimir Wolfblood's token: "Voja, a legendary 2/2 green and white Wolf
 * creature token" — named Voja, its type Wolf (the ruling), so the legend
 * rule (704.5j) applies to a second one.
 */
export default defineCard({
  name: "Voja",
  art: "af8ba142-4f39-45e4-8872-b6e348fd760c",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
});
