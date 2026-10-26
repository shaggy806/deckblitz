import { defineCard } from "../define.js";

export default defineCard({
  name: "Spawn of Rix Maadi",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 5,
  toughness: 3,
  keywords: ["unleash"],
  text: "Unleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)",
});
