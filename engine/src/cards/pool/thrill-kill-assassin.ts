import { defineCard } from "../define.js";

export default defineCard({
  name: "Thrill-Kill Assassin",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 2,
  keywords: ["deathtouch", "unleash"],
  text: "Deathtouch\nUnleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)",
});
