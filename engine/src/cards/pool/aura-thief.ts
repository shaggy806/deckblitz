import { defineCard } from "../define.js";

export default defineCard({
  name: "Aura Thief",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature dies, you gain control of all enchantments. (You don't get to move Auras.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-control-all", filter: { type: "enchantment" }, untilEndOfTurn: false },
      resolve: null,
      text: "When this creature dies, you gain control of all enchantments. (You don't get to move Auras.)",
    },
  ],
});
