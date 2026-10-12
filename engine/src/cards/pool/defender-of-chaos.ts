import { defineCard } from "../define.js";

export default defineCard({
  name: "Defender of Chaos",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
  keywords: ["flash"],
  text: "Flash\nProtection from white",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
  ],
});
