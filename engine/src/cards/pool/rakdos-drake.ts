import { defineCard } from "../define.js";

export default defineCard({
  name: "Rakdos Drake",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 1,
  toughness: 2,
  keywords: ["flying", "unleash"],
  text: "Flying\nUnleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)",
});
