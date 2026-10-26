import { defineCard } from "../define.js";

// Urza's Saga. EDHREC rank 31645.
//
// "If you control another nonland permanent" is an intervening-if (rule
// 603.4), checked as it triggers and again as it resolves.

const TEXT = "At the beginning of your upkeep, if you control another nonland permanent, sacrifice this creature.";

export default defineCard({
  name: "Reclusive Wight",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Minion"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "controls", filter: { notTypes: ["land"] }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
