import { defineCard } from "../define.js";

export default defineCard({
  name: "Commander Eesha",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying, protection from creatures",
  static: [{ affects: { scope: "self" }, protection: { types: ["creature"] }, text: "Protection from creatures" }],
});
