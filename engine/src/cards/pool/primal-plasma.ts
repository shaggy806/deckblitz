import { defineCard } from "../define.js";

export default defineCard({
  name: "Primal Plasma",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Shapeshifter"],
  power: 0,
  toughness: 0,
  text: "As this creature enters, it becomes your choice of a 3/3 creature, a 2/2 creature with flying, or a 1/6 creature with defender.",
  becomesOnEnter: {
    forms: [
      { label: "3/3 creature", as: { power: 3, toughness: 3 } },
      { label: "2/2 creature with flying", as: { power: 2, toughness: 2, keywords: ["flying"] } },
      { label: "1/6 creature with defender", as: { power: 1, toughness: 6, keywords: ["defender"] } },
    ],
  },
});
