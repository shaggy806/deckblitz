import { defineCard } from "../define.js";

// The sacrifice trigger fires however it was sacrificed — its own upkeep
// trigger included (the ruling).
const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice a creature.";
const SAC_TEXT = "When you sacrifice this creature, each opponent discards a card, you draw a card, and you gain 2 life.";

export default defineCard({
  name: "Daemogoth Woe-Eater",
  manaCost: "{1}{B}{B/G}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 7,
  toughness: 6,
  text: `${UPKEEP_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "you", selfOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 1 },
          { kind: "draw", amount: 1 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
