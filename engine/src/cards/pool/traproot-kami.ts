import { defineCard } from "../define.js";

const TEXT = "Traproot Kami's toughness is equal to the number of Forests on the battlefield.";

export default defineCard({
  name: "Traproot Kami",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  keywords: ["defender", "reach"],
  text: `Defender; reach (This creature can block creatures with flying.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Forest" } },
        plusPower: 0,
        plusToughness: 0,
        only: "toughness",
      },
      text: TEXT,
    },
  ],
});
