import { defineCard } from "../define.js";

// EDHREC rank 20951.
//
// The second mode targets an Incubator token — the front face; one that has
// already transformed is a Phyrexian, not an Incubator, and can't be chosen.
const COUNTER_TEXT = "Put a +1/+1 counter on target artifact or creature you control.";
const TRANSFORM_TEXT = "Transform target Incubator token you control.";

export default defineCard({
  name: "Seedpod Caretaker",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 2,
  toughness: 2,
  text: `When this creature enters, choose one —\n• ${COUNTER_TEXT}\n• ${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: COUNTER_TEXT,
            targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
          {
            text: TRANSFORM_TEXT,
            targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Incubator", token: true } }],
            effect: { kind: "transform", target: 0 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
