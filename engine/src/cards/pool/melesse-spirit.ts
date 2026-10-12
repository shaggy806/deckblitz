import { defineCard } from "../define.js";

export default defineCard({
  name: "Melesse Spirit",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Spirit"],
  power: 3,
  toughness: 3,
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
