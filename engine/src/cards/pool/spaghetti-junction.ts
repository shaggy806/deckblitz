import { defineCard } from "../define.js";

// Playtest card (Unknown Event). The last ability is a state trigger (rule
// 603.8): it triggers while the land has exactly eight traffic counters —
// the text says "eight", where Darksteel Reactor says "twenty or more" — and
// not again while that ability is on the stack. "If you do" is the
// sacrifice's `then` (Aang's Iceberg): a land already gone makes no token.

const MANA_TEXT = "{T}: Add {C}.";
const VEHICLE_TEXT = "{4}, {T}: Create a 3/2 colorless Vehicle artifact token with crew 1.";
const ATTACK_TEXT = "Whenever a Vehicle you control attacks, put a traffic counter on this land.";
const STATE_TEXT =
  "When this land has eight traffic counters on it, sacrifice it. If you do, create Atlantakul, a legendary 20/20 colorless Eldrazi creature token with annihilator 2.";

export default defineCard({
  name: "Spaghetti Junction",
  colors: [],
  types: ["land"],
  text: `${MANA_TEXT}\n${VEHICLE_TEXT}\n${ATTACK_TEXT}\n${STATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Vehicle Token", count: 1 },
      resolve: null,
      text: VEHICLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtype: "Vehicle" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "traffic", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: {
        on: "state",
        state: { kind: "self-counters", counter: "traffic", compare: { op: "eq", n: 8 } },
      },
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: { kind: "create-token", token: "Atlantakul", count: 1 },
      },
      resolve: null,
      text: STATE_TEXT,
    },
  ],
});
