import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 23896. Traproot Kami's count, on power.

const TEXT = "Coiling Woodworm's power is equal to the number of Forests on the battlefield.";

export default defineCard({
  name: "Coiling Woodworm",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Worm"],
  power: 0,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Forest" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: TEXT,
    },
  ],
});
