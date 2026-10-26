import { defineCard } from "../define.js";

const DIES_TEXT = "When enchanted creature dies, you draw two cards.";

export default defineCard({
  name: "Bequeathal",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n" + DIES_TEXT,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
