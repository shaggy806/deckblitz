import { defineCard } from "../define.js";
import { increment } from "../helpers.js";

// EDHREC rank 17303. Secrets of Strixhaven.

const INCREMENT = increment();

export default defineCard({
  name: "Cuboid Colony",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  keywords: ["flash", "flying", "trample"],
  text: `Flash\nFlying, trample\n${INCREMENT.text}`,
  triggered: [INCREMENT],
});
