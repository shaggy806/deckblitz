import { defineCard } from "../define.js";

const WOLVES_TEXT =
  "When you pay this cost one or more times, put that many +1/+1 counters on this creature, then up to that many target lands you control become 3/3 Wolf creatures with haste that are still lands.";
const ETB_TEXT = `When this creature enters, you may pay {1}{G} any number of times. ${WOLVES_TEXT}`;

// The reflexive ability's targets are chosen as it goes on the stack, up to the
// number of times paid (rules 603.12, 603.3d), and the lands stay creatures
// with no duration to end it.
export default defineCard({
  name: "Primal Adversary",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{G} any number of times for that many counters and Wolf lands?",
        cost: "{1}{G}",
        costTimes: true,
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "any-number", of: "land-you-control", max: "x" }],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
              {
                kind: "for-each-target",
                from: 0,
                effect: {
                  kind: "animate",
                  target: 0,
                  power: 3,
                  toughness: 3,
                  addTypes: ["creature"],
                  addSubtypes: ["Wolf"],
                  keywords: ["haste"],
                  duration: "permanent",
                },
              },
            ],
          },
          text: WOLVES_TEXT,
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
