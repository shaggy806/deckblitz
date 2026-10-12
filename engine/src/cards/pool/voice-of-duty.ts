import { defineCard } from "../define.js";

export default defineCard({
  name: "Voice of Duty",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying, protection from green",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["G"] },
      text: "Protection from green",
    },
  ],
});
