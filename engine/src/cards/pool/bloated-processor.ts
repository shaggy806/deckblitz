import { defineCard } from "../define.js";

// EDHREC rank 11421.
//
// "Its power" is read as it last existed on the battlefield (rule 608.2h) —
// `powerOf: "source"` of a dies trigger, Galuf's Final Act's shape.

const SAC_TEXT = "Sacrifice another Phyrexian: Put a +1/+1 counter on this creature.";
const DIES_TEXT = "When this creature dies, incubate X, where X is its power.";

export default defineCard({
  name: "Bloated Processor",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian"],
  power: 3,
  toughness: 2,
  text: `${SAC_TEXT}\n${DIES_TEXT} (Create an Incubator token with X +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Phyrexian" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: SAC_TEXT,
      otherOnly: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "incubate", amount: { powerOf: "source" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
