import { defineCard } from "../define.js";

// An X/X green Dinosaur Beast with trample: X is set as it's created.
export default defineCard({
  name: "Dinosaur Beast Token",
  art: "ce81e7fe-66fc-4073-a920-bdfc0bf860b9",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Beast"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: "Trample",
});
