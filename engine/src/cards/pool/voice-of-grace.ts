import { defineCard } from "../define.js";

export default defineCard({
  name: "Voice of Grace",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 2,
  toughness: 2,
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
