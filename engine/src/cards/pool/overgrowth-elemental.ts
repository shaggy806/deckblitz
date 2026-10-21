import { defineCard } from "../define.js";

// EDHREC rank 19405.
//
// "If that creature was an Elemental" reads the creature as it last existed
// on the battlefield (rule 603.10a). If this creature died beside it, the
// counter has nowhere to go (the ruling), and the life is still gained.
//
// Rulings:
//   [2019-07-12] If Overgrowth Elemental dies at the same time as one or more other creatures you
//     control, Overgrowth Elemental's last ability triggers for each of those other creatures. You
//     will gain 1 life for each of them, but if any of those creatures were Elementals, Overgrowth
//     Elemental won't get a +1/+1 counter since it's already left the battlefield.

const ENTERS = "When this creature enters, put a +1/+1 counter on another target Elemental you control.";
const DIES =
  "Whenever another creature you control dies, you gain 1 life. If that creature was an Elemental, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Overgrowth Elemental",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 2,
  text: `${ENTERS}\n${DIES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { subtype: "Elemental" } } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { subtype: "Elemental" } },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
});
