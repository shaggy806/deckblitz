import { defineCard } from "../define.js";

// "Any player may activate this ability but only during any upkeep step":
// `anyPlayer`, with Dwarven Armory's upkeep condition.

const UPKEEP_TEXT = "At the beginning of your upkeep, put a time counter on this artifact.";
const PUMP_TEXT = "All creatures get +1/+0 for each time counter on this artifact.";
const REMOVE_TEXT =
  "{3}: Remove a time counter from this artifact. Any player may activate this ability but only during any upkeep step.";

export default defineCard({
  name: "Infinite Hourglass",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${UPKEEP_TEXT}\n${PUMP_TEXT}\n${REMOVE_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature" } },
      grantPtPerCount: { countersOnSource: "time", pt: [1, 0] },
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      anyPlayer: true,
      condition: { kind: "turn-structure", steps: ["upkeep"] },
      text: REMOVE_TEXT,
    },
  ],
});
