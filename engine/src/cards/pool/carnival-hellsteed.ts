import { defineCard } from "../define.js";

export default defineCard({
  name: "Carnival Hellsteed",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horse"],
  power: 5,
  toughness: 4,
  keywords: ["first-strike", "haste", "unleash"],
  text: "First strike, haste\nUnleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)",
});
