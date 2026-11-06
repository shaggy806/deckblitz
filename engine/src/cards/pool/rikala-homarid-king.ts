import { defineCard } from "../define.js";

// Mystery Booster Commander. The tide counters cycle 1-2-3-0 (the fourth is
// removed with the rest as the upkeep trigger resolves).
const UPKEEP =
  "At the beginning of your upkeep, put a tide counter on Rikala. Then if there are four or more tide counters on Rikala, remove them.";
const ANTHEM = "Creatures you control get +1/+0 for each tide counter on Rikala.";
const ISLAND =
  "Whenever you tap an Island for mana, if there are three or more tide counters on Rikala, add an additional {U}.";

export default defineCard({
  name: "Rikala, Homarid King",
  manaCost: "{1}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Lobster", "Noble"],
  power: 0,
  toughness: 4,
  text: `${UPKEEP}\n${ANTHEM}\n${ISLAND}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "tide", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "tide", compare: { op: "gte", n: 4 } },
            then: {
              kind: "remove-counter",
              target: "source",
              counter: "tide",
              amount: { countersOn: "source", counter: "tide" },
            },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "tapped-for-mana", who: "you-control", filter: { subtype: "Island" } },
      condition: { kind: "self-counters", counter: "tide", compare: { op: "gte", n: 3 } },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: ISLAND,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPtPerCount: { countersOnSource: "tide", pt: [1, 0] },
      text: ANTHEM,
    },
  ],
});
