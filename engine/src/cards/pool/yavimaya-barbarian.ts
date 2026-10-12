import { defineCard } from "../define.js";

export default defineCard({
  name: "Yavimaya Barbarian",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Barbarian"],
  power: 2,
  toughness: 2,
  text: "Protection from blue",
  static: [{ affects: { scope: "self" }, protection: { colors: ["U"] }, text: "Protection from blue" }],
});
