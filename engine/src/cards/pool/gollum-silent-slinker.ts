import { defineCard } from "../define.js";

// EDHREC rank 22120.
// Its Adventure is Meager Meal (meager-meal.ts).

export default defineCard({
  name: "Gollum, Silent Slinker",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Horror"],
  power: 4,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)",
  faces: ["Gollum, Silent Slinker", "Meager Meal"],
  adventure: true,
});
