import { defineCard } from "../define.js";

// Cynette, Jelly Drover's token: a 1/1 blue Jellyfish with flying.

export default defineCard({
  name: "Jellyfish Token",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Jellyfish"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
