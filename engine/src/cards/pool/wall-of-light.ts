import { defineCard } from "../define.js";

export default defineCard({
  name: "Wall of Light",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 1,
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
