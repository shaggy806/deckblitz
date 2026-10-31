import { defineCard } from "../define.js";

// Dominaria United Commander (DMC). EDHREC rank 14511.
//
// Orca's power as it last existed on the battlefield (rule 608.2h) is the
// total, read as the dies trigger is put on the stack, when the number of
// targets and the division are announced (rules 603.3d, 601.2d) — at least
// 1 to each target; a target gone illegal loses its share (608.2b).

const COUNTER_TEXT = "Whenever another creature dies, put a +1/+1 counter on Orca.";
const DIES_TEXT = "When Orca dies, it deals damage equal to its power divided as you choose among any number of targets.";

export default defineCard({
  name: "Orca, Siege Demon",
  manaCost: "{5}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  text: `Trample\n${COUNTER_TEXT}\n${DIES_TEXT}`,
  keywords: ["trample"],
  triggered: [
    {
      trigger: { on: "dies", who: "any", otherOnly: true, filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "any-number", of: "any-target" }],
      divided: { total: { powerOf: "source" }, slot: 0 },
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
