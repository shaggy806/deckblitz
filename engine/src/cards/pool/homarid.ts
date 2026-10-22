import { defineCard } from "../define.js";

// Fallen Empires (FEM). EDHREC rank 29752.
//
// The tide cycle: the fourth counter fires a state trigger (rule 603.8) that
// clears them all, so the -1/-1 comes back with the next upkeep's counter.

const ENTERS = "This creature enters with a tide counter on it.";
const UPKEEP = "At the beginning of your upkeep, put a tide counter on this creature.";
const ONE = "As long as there is exactly one tide counter on this creature, it gets -1/-1.";
const THREE = "As long as there are exactly three tide counters on this creature, it gets +1/+1.";
const FOUR = "Whenever there are four or more tide counters on this creature, remove all tide counters from it.";

export default defineCard({
  name: "Homarid",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homarid"],
  power: 2,
  toughness: 2,
  text: [ENTERS, UPKEEP, ONE, THREE, FOUR].join("\n"),
  static: [
    { affects: { scope: "self" }, replacement: { event: "enters-battlefield", counters: { kind: "tide", amount: 1 } }, text: ENTERS },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "tide", compare: { op: "eq", n: 1 } },
      grantPt: [-1, -1],
      text: ONE,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "tide", compare: { op: "eq", n: 3 } },
      grantPt: [1, 1],
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
