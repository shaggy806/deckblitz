import { defineCard } from "../define.js";

const COMBAT_TEXT =
  "At the beginning of combat on your turn, put X +1/+1 counters on target creature you control, where X is one plus the amount of life you gained this turn.";

export default defineCard({
  name: "Sickbay",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `Whenever a creature you control enters, you gain 1 life.\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control enters, you gain 1 life.",
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      // X is read as the ability resolves.
      effect: {
        kind: "add-counter",
        target: 0,
        counter: "+1/+1",
        amount: { sum: [1, { turnStat: "life-gained", who: "you" }] },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
