import { defineCard } from "../define.js";

// EDHREC rank 18688.
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, you may put a quest counter on this enchantment.";
const SAC_TEXT = "Remove three quest counters from this enchantment and sacrifice it: You gain 8 life.";

export default defineCard({
  name: "Sunspring Expedition",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${LANDFALL_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a quest counter on Sunspring Expedition?",
        effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "quest", count: 3 }, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 8 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
