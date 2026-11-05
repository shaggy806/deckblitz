import { defineCard } from "../define.js";

// A 1/1 green and white Alien Insect creature token with flying.

export default defineCard({
  name: "Alien Insect Token",
  art: "c832e03c-111a-409e-a88c-6edbb528a239",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Alien", "Insect"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
