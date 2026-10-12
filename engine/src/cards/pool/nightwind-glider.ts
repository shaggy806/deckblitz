import { defineCard } from "../define.js";

export default defineCard({
  name: "Nightwind Glider",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying, protection from black",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
