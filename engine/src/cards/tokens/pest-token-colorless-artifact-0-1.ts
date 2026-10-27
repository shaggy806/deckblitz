import { defineCard } from "../define.js";

/** "A 0/1 colorless Pest artifact creature token" with no abilities (Nuisance
 * Engine). Not the black and green 1/1 Pests (`Pest Token`, `Pest Token
 * (Attacks)`). No token printing of it exists, so it pins no art. */
export default defineCard({
  name: "Pest Token (Colorless Artifact, 0/1)",
  tokenName: "Pest",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Pest"],
  power: 0,
  toughness: 1,
  text: "",
});
