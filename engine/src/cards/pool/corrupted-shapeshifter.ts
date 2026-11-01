import { defineCard } from "../define.js";

// Devoid: colourless (`colors: []`). Its * and * are 0 anywhere but the
// battlefield (its ruling).
export default defineCard({
  name: "Corrupted Shapeshifter",
  manaCost: "{3}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Shapeshifter"],
  power: 0,
  toughness: 0,
  text:
    "Devoid (This card has no color.)\n" +
    "As this creature enters, it becomes your choice of a 3/3 creature with flying, a 2/5 creature with vigilance, or " +
    "a 0/12 creature with defender.",
  becomesOnEnter: {
    forms: [
      { label: "3/3 creature with flying", as: { basePt: [3, 3], keywords: ["flying"] } },
      { label: "2/5 creature with vigilance", as: { basePt: [2, 5], keywords: ["vigilance"] } },
      { label: "0/12 creature with defender", as: { basePt: [0, 12], keywords: ["defender"] } },
    ],
  },
});
