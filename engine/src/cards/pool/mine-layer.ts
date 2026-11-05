import { defineCard } from "../define.js";

// EDHREC rank 19166.
//
// "Destroy it" is the land that became tapped (Blight's trigger object); the
// leave trigger takes every mine counter off every land at once.
const COUNTER_TEXT = "{1}{R}, {T}: Put a mine counter on target land.";
const TAPPED_TEXT = "Whenever a land with a mine counter on it becomes tapped, destroy it.";
const LEAVE_TEXT = "When this creature leaves the battlefield, remove all mine counters from all lands.";

export default defineCard({
  name: "Mine Layer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 1,
  toughness: 1,
  text: `${COUNTER_TEXT}\n${TAPPED_TEXT}\n${LEAVE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: ["land"],
      effect: { kind: "add-counter", target: 0, counter: "mine", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "becomes-tapped",
        who: "any",
        filter: { type: "land", counters: { kind: "mine", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: TAPPED_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "remove-counter-all", filter: { type: "land" }, counter: "mine", amount: "all" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
