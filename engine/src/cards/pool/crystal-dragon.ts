import { defineCard } from "../define.js";

export default defineCard({
  name: "Crystal Dragon",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance",
  faces: ["Crystal Dragon", "Rob the Hoard"],
  adventure: true,
});
