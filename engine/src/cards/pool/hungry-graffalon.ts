import { defineCard } from "../define.js";
import { increment } from "../helpers.js";

// EDHREC rank 24238. Secrets of Strixhaven.

const INCREMENT = increment();

export default defineCard({
  name: "Hungry Graffalon",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giraffe"],
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${INCREMENT.text}`,
  triggered: [INCREMENT],
});
