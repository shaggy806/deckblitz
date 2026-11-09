import { defineCard } from "../define.js";

export default defineCard({
  name: "Spatial Binding",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  text: "Pay 1 life: Until your next upkeep, target permanent can't phase out.",
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 1 },
      targets: ["permanent"],
      effect: { kind: "prohibit", prohibits: [{ act: "phase-out", target: 0 }], duration: "until-your-next-upkeep" },
      resolve: null,
      text: "Pay 1 life: Until your next upkeep, target permanent can't phase out.",
    },
  ],
});
