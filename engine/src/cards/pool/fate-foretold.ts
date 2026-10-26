import { defineCard } from "../define.js";

const ETB_TEXT = "When this Aura enters, draw a card.";
const DIES_TEXT = "When enchanted creature dies, its controller draws a card.";

export default defineCard({
  name: "Fate Foretold",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ETB_TEXT}\n${DIES_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "draw", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
