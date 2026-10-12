import { defineCard } from "../define.js";

export default defineCard({
  name: "Faerie Guidemother",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
  faces: ["Faerie Guidemother", "Gift of the Fae"],
  adventure: true,
});
