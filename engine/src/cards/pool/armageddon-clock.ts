import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, put a doom counter on this artifact.";
const DRAW_TEXT =
  "At the beginning of your draw step, this artifact deals damage equal to the number of doom counters on it to each player.";
const REMOVE_TEXT =
  "{4}: Remove a doom counter from this artifact. Any player may activate this ability but only during any upkeep step.";

export default defineCard({
  name: "Armageddon Clock",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `${UPKEEP_TEXT}\n${DRAW_TEXT}\n${REMOVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "doom", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "draw", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: { countersOn: "source", counter: "doom" }, who: "each-player" },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "doom", amount: 1 },
      resolve: null,
      anyPlayer: true,
      condition: { kind: "turn-structure", steps: ["upkeep"] },
      text: REMOVE_TEXT,
    },
  ],
});
