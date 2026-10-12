import { defineCard } from "../define.js";

export default defineCard({
  name: "Abbey Gargoyles",
  manaCost: "{2}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Gargoyle"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying, protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});
