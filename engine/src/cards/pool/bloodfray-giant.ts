import { defineCard } from "../define.js";

export default defineCard({
  name: "Bloodfray Giant",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 4,
  toughness: 3,
  keywords: ["trample", "unleash"],
  text: "Trample\nUnleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)",
});
