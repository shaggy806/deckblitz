import { defineCard } from "../define.js";

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, you may put a quest counter on this enchantment.";
const SAC_TEXT =
  "Remove three quest counters from this enchantment and sacrifice it: Create a 7/1 red Elemental creature token with trample and haste. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Zektar Shrine Expedition",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${LANDFALL_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a quest counter on Zektar Shrine Expedition?",
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
      effect: {
        kind: "create-token",
        token: "Elemental Token 7/1 (Trample, Haste)",
        count: 1,
        exileAtEndStep: true,
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
