import { defineCard } from "../define.js";

// EDHREC rank 11027. Bronze Guardian's power-only CDA; a permanent that's both
// an artifact and an enchantment matches the filter once (the ruling).

const CDA_TEXT = "Shambling Suit's power is equal to the number of artifacts and/or enchantments you control.";

export default defineCard({
  name: "Shambling Suit",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 3,
  text: CDA_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { typesAnyOf: ["artifact", "enchantment"], controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: CDA_TEXT,
    },
  ],
});
