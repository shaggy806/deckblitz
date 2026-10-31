import { defineCard } from "../define.js";

const DIES_TEXT =
  "When this creature dies, you may distribute a number of +1/+1 counters equal to the number of +1/+1 counters on this creature among any number of creatures you control.";

// No targets: the division is chosen as the trigger resolves (rule 608.2d —
// its ruling), the total its +1/+1 counters as it died (608.2h).
export default defineCard({
  name: "Vastwood Hydra",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  text: `This creature enters with X +1/+1 counters on it.\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "This creature enters with X +1/+1 counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Distribute +1/+1 counters among creatures you control?",
        effect: {
          kind: "counters-distributed",
          counter: "+1/+1",
          total: { countersOn: "source", counter: "+1/+1" },
          filter: { type: "creature", controlledBy: "you" },
          among: "creatures you control",
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
