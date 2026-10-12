import { defineCard } from "../define.js";

export default defineCard({
  name: "Juvenile Gloomwidow",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 1,
  toughness: 3,
  keywords: ["reach", "wither"],
  text: "Reach (This creature can block creatures with flying.)\nWither (This deals damage to creatures in the form of -1/-1 counters.)",
});
