import { defineCard } from "../define.js";

export default defineCard({
  name: "Oraxid",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Crab", "Beast"],
  power: 2,
  toughness: 3,
  text: "Protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});
