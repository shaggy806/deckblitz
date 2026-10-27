import { defineCard } from "../define.js";

// EDHREC rank 11584. Mirrodin.
//
// Rulings:
//   [2004-12-01] If you activate Jinxed Choker's activated ability, you choose to either add or
//     remove a counter when the ability resolves.
//   [2004-12-01] "You" is always Jinxed Choker's current controller.
//
// The {3} ability's choice is an unannounced modal, so it's made as the
// ability resolves. The end-step trigger's opponent puts the counter on
// (`by`), after taking control.

const END_TEXT =
  "At the beginning of your end step, target opponent gains control of this artifact and puts a charge counter on it.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, this artifact deals damage to you equal to the number of charge counters on it.";
const ACTIVATED_TEXT = "{3}: Put a charge counter on this artifact or remove one from it.";

export default defineCard({
  name: "Jinxed Choker",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${END_TEXT}\n${UPKEEP_TEXT}\n${ACTIVATED_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put a charge counter on this artifact.",
            effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
          },
          {
            text: "Remove a charge counter from this artifact.",
            effect: { kind: "remove-counter", target: "source", counter: "charge", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: "source", who: { target: 0 }, untilEndOfTurn: false },
          { kind: "add-counter", target: "source", counter: "charge", amount: 1, by: { target: 0 } },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: { countersOn: "source", counter: "charge" }, who: "you" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
