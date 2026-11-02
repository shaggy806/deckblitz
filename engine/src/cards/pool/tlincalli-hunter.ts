import { defineCard } from "../define.js";

const TEXT = "Once each turn, you may pay {0} rather than pay the mana cost for a creature spell you cast from exile.";

export default defineCard({
  name: "Tlincalli Hunter",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Scorpion", "Scout"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        oncePerTurn: true,
        fromZones: ["exile"],
        filter: { type: "creature" },
      },
      text: TEXT,
    },
  ],
  faces: ["Tlincalli Hunter", "Retrieve Prey"],
  adventure: true,
});
