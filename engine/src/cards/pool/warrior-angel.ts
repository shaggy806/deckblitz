import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 29498. Zebra Unicorn's shape.

const TEXT = "Whenever this creature deals damage, you gain that much life.";

export default defineCard({
  name: "Warrior Angel",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Warrior"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
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
