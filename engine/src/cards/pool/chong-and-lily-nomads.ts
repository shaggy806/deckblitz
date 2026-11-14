import { defineCard } from "../define.js";

// The mode (and the first mode's Sagas) is chosen as the trigger goes on the
// stack. A lore counter put on a Saga this way triggers its chapter at once
// (the ruling). The bonus counts the lore counters as it resolves.
const TRIGGER_TEXT = "Whenever one or more Bards you control attack, choose one —";
const LORE_MODE = "Put a lore counter on each of any number of target Sagas you control.";
const PUMP_MODE =
  "Creatures you control get +1/+0 until end of turn for each lore counter among Sagas you control.";
const LORE = { aggregate: "sum", of: { counters: "lore" }, filter: { subtype: "Saga", controlledBy: "you" } } as const;

export default defineCard({
  name: "Chong and Lily, Nomads",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Bard", "Ally"],
  power: 3,
  toughness: 3,
  text: `${TRIGGER_TEXT}\n• ${LORE_MODE}\n• ${PUMP_MODE}`,
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you", filter: { subtype: "Bard" } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: LORE_MODE,
            targets: [{ kind: "any-number", of: { kind: "permanent", whose: "you", filter: { subtype: "Saga" } } }],
            effect: {
              kind: "for-each-target",
              from: 0,
              effect: { kind: "add-counter", target: 0, counter: "lore", amount: 1 },
            },
          },
          {
            text: PUMP_MODE,
            effect: {
              kind: "modify-pt-all",
              filter: { type: "creature", controlledBy: "you" },
              power: LORE,
              toughness: 0,
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${LORE_MODE} ${PUMP_MODE}`,
    },
  ],
});
