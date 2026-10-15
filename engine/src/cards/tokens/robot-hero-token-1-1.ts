import { defineCard } from "../define.js";

// The 1/1 Robot Hero (Shuri, Vibranium Technologist; Virtual Assistant) —
// Iron Man, Tony Stark's "Robot Hero Token" is a 2/1.

export default defineCard({
  name: "1/1 Robot Hero Token",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Hero"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
