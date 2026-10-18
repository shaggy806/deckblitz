import { defineCard } from "../define.js";

// EDHREC rank 8924.
//
// "Transforms into a Phyrexian": either direction, as long as it's a
// Phyrexian after turning over (the ruling) — the filter reads the permanent
// as it is once transformed. Only a transforming permanent transforms; a
// face-down one turning face up doesn't (the ruling).
const INCUBATE_TEXT = "When this creature enters, incubate 2.";
const TRANSFORM_TEXT = "Whenever a permanent you control transforms into a Phyrexian, put a +1/+1 counter on it.";

export default defineCard({
  name: "Norn's Inquisitor",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Knight"],
  power: 1,
  toughness: 1,
  text: `${INCUBATE_TEXT} (Create an Incubator token with two +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "incubate", amount: 2 },
      resolve: null,
      text: INCUBATE_TEXT,
    },
    {
      trigger: { on: "transforms", who: "you-control", filter: { subtype: "Phyrexian" } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
});
