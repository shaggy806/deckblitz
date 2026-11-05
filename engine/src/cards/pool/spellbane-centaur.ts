import { defineCard } from "../define.js";

// EDHREC rank 28064.

export default defineCard({
  name: "Spellbane Centaur",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur"],
  power: 3,
  toughness: 2,
  text: "Creatures you control can't be the targets of blue spells or abilities from blue sources.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      hexproofFrom: { colors: ["U"], anyController: true, notHexproof: true },
      text: "Creatures you control can't be the targets of blue spells or abilities from blue sources.",
    },
  ],
});
