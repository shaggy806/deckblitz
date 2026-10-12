import { defineCard } from "../define.js";

export default defineCard({
  name: "Ettercap",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider", "Beast"],
  power: 2,
  toughness: 5,
  keywords: ["reach"],
  text: "Reach",
  faces: ["Ettercap", "Web Shot"],
  adventure: true,
});
