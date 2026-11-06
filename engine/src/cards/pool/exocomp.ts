import { defineCard } from "../define.js";

export default defineCard({
  name: "Exocomp",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)",
});
