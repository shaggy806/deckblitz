import { defineCard } from "../define.js";

export default defineCard({
  name: "Rakdos Cackler",
  manaCost: "{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 1,
  toughness: 1,
  keywords: ["unleash"],
  text: "Unleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)",
});
