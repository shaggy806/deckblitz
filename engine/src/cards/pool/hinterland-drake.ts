import { defineCard } from "../define.js";

// EDHREC rank 30942. Only creatures attack, so "can't block artifact
// creatures" is "can block only nonartifact creatures".

const STATIC = "This creature can't block artifact creatures.";

export default defineCard({
  name: "Hinterland Drake",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${STATIC}`,
  static: [{ affects: { scope: "self" }, canBlockOnly: { notTypes: ["artifact"] }, text: STATIC }],
});
