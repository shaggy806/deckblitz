import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 30043.

const TEXT = "Whenever this creature deals damage, you gain that much life.";

export default defineCard({
  name: "Horned Cheetah",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
