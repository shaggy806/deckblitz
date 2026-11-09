import { defineCard } from "../define.js";

// Back face of Saheeli's Lattice. Its power reads the exiled cards used to
// craft it; a token used to craft leaves nothing to read (its ruling).
export default defineCard({
  name: "Mastercraft Raptor",
  art: "https://cards.scryfall.io/art_crop/back/0/b/0bdc79c6-1193-46bd-931d-2c2a0381e420.jpg",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Dinosaur"],
  power: 0,
  toughness: 4,
  text: "Mastercraft Raptor's power is equal to the total power of the exiled cards used to craft it.",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "sum", of: "power", filter: {}, in: "exiled-with-source" },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: "Mastercraft Raptor's power is equal to the total power of the exiled cards used to craft it.",
    },
  ],
  faces: ["Saheeli's Lattice", "Mastercraft Raptor"],
  transform: true,
});
