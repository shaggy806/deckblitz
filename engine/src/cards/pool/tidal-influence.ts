import { defineCard } from "../define.js";

// Fallen Empires (FEM). EDHREC rank 30440.
//
// Rulings:
//   As soon as the number of counters on this card changes, so does the power of blue creatures.
//
// "No permanents named Tidal Influence" is everyone's: yours and every
// opponent's. The fourth counter fires a state trigger (rule 603.8).

const CAST = "Cast this spell only if no permanents named Tidal Influence are on the battlefield.";
const ENTERS = "This enchantment enters with a tide counter on it.";
const UPKEEP = "At the beginning of your upkeep, put a tide counter on this enchantment.";
const ONE = "As long as there is exactly one tide counter on this enchantment, all blue creatures get -2/-0.";
const THREE = "As long as there are exactly three tide counters on this enchantment, all blue creatures get +2/+0.";
const FOUR = "Whenever there are four or more tide counters on this enchantment, remove all tide counters from it.";
const NAMED = { name: "Tidal Influence" } as const;
const BLUE = { scope: "filter", filter: { type: "creature", colors: ["U"] } } as const;

export default defineCard({
  name: "Tidal Influence",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: [CAST, ENTERS, UPKEEP, ONE, THREE, FOUR].join("\n"),
  castOnlyIf: {
    kind: "all",
    of: [
      { kind: "not", of: { kind: "controls", filter: NAMED, atLeast: 1 } },
      { kind: "not", of: { kind: "opponent-controls", filter: NAMED, atLeast: 1 } },
    ],
  },
  static: [
    { affects: { scope: "self" }, replacement: { event: "enters-battlefield", counters: { kind: "tide", amount: 1 } }, text: ENTERS },
    {
      affects: BLUE,
      condition: { kind: "self-counters", counter: "tide", compare: { op: "eq", n: 1 } },
      grantPt: [-2, 0],
      text: ONE,
    },
    {
      affects: BLUE,
      condition: { kind: "self-counters", counter: "tide", compare: { op: "eq", n: 3 } },
      grantPt: [2, 0],
      text: THREE,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "tide", amount: 1 },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "state", state: { kind: "self-counters", counter: "tide", compare: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "tide", amount: { countersOn: "source", counter: "tide" } },
      resolve: null,
      text: FOUR,
    },
  ],
});
