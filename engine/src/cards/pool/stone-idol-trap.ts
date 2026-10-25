import { defineCard } from "../define.js";

// A mandatory reduction, not a Trap's alternative cost: every attacking
// creature counts, whoever controls it (the rulings). The token stays until
// *your* next end step, so cast on an opponent's turn it can attack on yours.
export default defineCard({
  name: "Stone Idol Trap",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "This spell costs {1} less to cast for each attacking creature.\nCreate a 6/12 colorless Construct artifact creature token with trample. Exile it at the beginning of your next end step.",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "creature", attacking: true } },
  },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Construct Token (Ancient Stone Idol)", count: 1 },
      {
        kind: "delayed-trigger",
        at: "your-next-end-step",
        about: "created",
        effect: { kind: "exile", target: 0 },
        text: "Exile it at the beginning of your next end step.",
      },
    ],
  },
});
