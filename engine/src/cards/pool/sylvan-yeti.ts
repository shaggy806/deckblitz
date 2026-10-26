import { defineCard } from "../define.js";

// Portal Second Age (P02). EDHREC rank 28198. Minas Tirith Garrison's CDA.

const PT_TEXT = "Sylvan Yeti's power is equal to the number of cards in your hand.";

export default defineCard({
  name: "Sylvan Yeti",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Yeti"],
  power: 0,
  toughness: 4,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0, only: "power" },
      text: PT_TEXT,
    },
  ],
});
