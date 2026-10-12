import { defineCard } from "../define.js";

export default defineCard({
  name: "Karoo Meerkat",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Mongoose"],
  power: 2,
  toughness: 1,
  text: "Protection from blue",
  static: [{ affects: { scope: "self" }, protection: { colors: ["U"] }, text: "Protection from blue" }],
});
