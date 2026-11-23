import { defineCard } from "../define.js";

// Playtest card (Unknown Event).

export default defineCard({
  name: "Colossal Dreadmaw and Storm Crow",
  manaCost: "{5}{U}{G}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Bird"],
  power: 7,
  toughness: 8,
  keywords: ["flying", "trample"],
  text: "Flying, trample",
});
