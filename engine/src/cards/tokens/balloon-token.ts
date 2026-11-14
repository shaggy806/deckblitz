import { defineCard } from "../define.js";

// A 1/1 red Balloon creature token with flying — Balloon Stand's.
export default defineCard({
  name: "Balloon Token",
  art: "4c8f2c0f-7ed8-4d72-8f94-33ad615bf21d",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Balloon"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
