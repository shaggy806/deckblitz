import { defineCard } from "../define.js";

// The end step's "if this artifact is untapped" is an intervening if (rule
// 603.4): checked as it triggers and again as it resolves. It's destroyed, then
// deals damage equal to the pin counters it had — as it last existed once gone
// (rule 608.2h). The activated ability's X is defined by its text (107.3c,
// `xIs`): {X}{X} is twice its pin counters as it's activated.

const UPKEEP = "At the beginning of your upkeep, put a pin counter on this artifact.";
const END =
  "At the beginning of your end step, if this artifact is untapped, destroy this artifact and it deals damage to you equal to the number of pin counters on it.";
const PING =
  "{X}{X}, {T}: This artifact deals damage equal to the number of pin counters on it to any target. X is the number of pin counters on this artifact.";
const PINS = { countersOn: "source", counter: "pin" } as const;

export default defineCard({
  name: "Voodoo Doll",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `${UPKEEP}\n${END}\n${PING}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "pin", amount: 1 },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "source", filter: { tapped: false } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: "source" },
          { kind: "damage", amount: PINS, who: "you" },
        ],
      },
      resolve: null,
      text: END,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}{X}", tap: true },
      xIs: { amount: PINS },
      targets: ["any-target"],
      effect: { kind: "damage", amount: PINS, target: 0 },
      resolve: null,
      text: PING,
    },
  ],
});
