import { defineCard } from "../define.js";

// EDHREC rank 7079.
// An Adventure card: the creature face here, Plant Beans in plant-beans.ts.
export default defineCard({
  name: "Beanstalk Wurm",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Wurm"],
  power: 5,
  toughness: 4,
  keywords: ["reach"],
  text: "Reach",
  faces: ["Beanstalk Wurm", "Plant Beans"],
  adventure: true,
});
