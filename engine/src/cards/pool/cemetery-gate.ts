import { defineCard } from "../define.js";

export default defineCard({
  name: "Cemetery Gate",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 5,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\nProtection from black",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
