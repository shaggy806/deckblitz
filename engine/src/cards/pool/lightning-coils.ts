import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 19758.
//
// Ventifact Bottle's shape: the intervening-if is checked as the trigger fires
// and again as it resolves (rule 603.4); "that many" is the charge counters
// on it as it resolves — all of them, which the next step removes.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, if this artifact has five or more charge counters on it, remove all of them from it and create that many 3/1 red Elemental creature tokens with haste. Exile them at the beginning of the next end step.";

export default defineCard({
  name: "Lightning Coils",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `Whenever a nontoken creature you control dies, put a charge counter on this artifact.\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { token: false, type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "Whenever a nontoken creature you control dies, put a charge counter on this artifact.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "self-counters", counter: "charge", compare: { op: "gte", n: 5 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "create-token",
            token: "3/1 Red Elemental Token (Haste)",
            count: { countersOn: "source", counter: "charge" },
            exileAtEndStep: true,
          },
          { kind: "remove-counter", target: "source", counter: "charge", amount: { countersOn: "source", counter: "charge" } },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
