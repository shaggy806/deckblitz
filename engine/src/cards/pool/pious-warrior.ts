import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 27125.

const TEXT = "Whenever this creature is dealt combat damage, you gain that much life.";

export default defineCard({
  name: "Pious Warrior",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Warrior"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self", combat: true },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
