import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 14769.
export default defineCard({
  name: "Scorn Effigy",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 3,
  text: "Foretell {0} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  foretell: { cost: "{0}" },
});
