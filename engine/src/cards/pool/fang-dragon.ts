import { defineCard } from "../define.js";

export default defineCard({
  name: "Fang Dragon",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying",
  faces: ["Fang Dragon", "Forktail Sweep"],
  adventure: true,
});
