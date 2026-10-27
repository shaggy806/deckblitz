import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 15611. With no recipient named, a
// `deals-damage` trigger fires once per creature per simultaneous damage
// event, for the total it dealt (a trampler's blocker and player together).

const TEXT = "Whenever a creature you control deals combat damage, you gain that much life.";

export default defineCard({
  name: "Noble Purpose",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
