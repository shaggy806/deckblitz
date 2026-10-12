import { defineCard } from "../define.js";

export default defineCard({
  name: "Mirran Crusader",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: "Double strike, protection from black and from green",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B", "G"] },
      text: "Protection from black and from green",
    },
  ],
});
