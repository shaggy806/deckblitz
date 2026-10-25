import { defineCard } from "../define.js";

// EDHREC rank 28026.
//
// "During an opponent's upkeep": not your turn, and the upkeep step
// (Colossus of Sardia's step condition, Lavinia's "not your turn").

export default defineCard({
  name: "Trade Caravan",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad"],
  power: 1,
  toughness: 1,
  text: "At the beginning of your upkeep, put a currency counter on this creature.\nRemove two currency counters from this creature: Untap target basic land. Activate only during an opponent's upkeep.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "currency", count: 2 } },
      condition: {
        kind: "all",
        of: [{ kind: "not", of: { kind: "your-turn" } }, { kind: "turn-structure", steps: ["upkeep"] }],
      },
      targets: [{ kind: "permanent", filter: { supertype: "basic", type: "land" } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "Remove two currency counters from this creature: Untap target basic land. Activate only during an opponent's upkeep.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "currency", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, put a currency counter on this creature.",
    },
  ],
});
