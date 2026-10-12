import { defineCard } from "../define.js";

export default defineCard({
  name: "Skylasher",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "reach"],
  cantBeCountered: true,
  text: "Flash\nThis spell can't be countered.\nReach, protection from blue",
  static: [{ affects: { scope: "self" }, protection: { colors: ["U"] }, text: "Protection from blue" }],
});
