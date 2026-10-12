import { defineCard } from "../define.js";

export default defineCard({
  name: "Treetop Sentinel",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 3,
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
