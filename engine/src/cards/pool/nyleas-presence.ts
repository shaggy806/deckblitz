import { defineCard } from "../define.js";

const ETB_TEXT = "When this Aura enters, draw a card.";
const TYPES_TEXT = "Enchanted land is every basic land type in addition to its other types.";

export default defineCard({
  name: "Nylea's Presence",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${ETB_TEXT}\n${TYPES_TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      addSubtypes: ["Plains", "Island", "Swamp", "Mountain", "Forest"],
      text: TYPES_TEXT,
    },
  ],
});
