import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 8452. A characteristic-defining ability (rule
// 604.3) counting creature cards in every graveyard — Mortivore's count,
// Polygoyf's +1 toughness.

const TEXT =
  "Lhurgoyf's power is equal to the number of creature cards in all graveyards and its toughness is equal to that number plus 1.";

export default defineCard({
  name: "Lhurgoyf",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lhurgoyf"],
  power: 0,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "creature" } },
        plusPower: 0,
        plusToughness: 1,
      },
      text: TEXT,
    },
  ],
});
