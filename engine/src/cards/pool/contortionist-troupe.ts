import { defineCard } from "../define.js";

const COVEN_TEXT =
  "Coven — At the beginning of your end step, if you control three or more creatures with different powers, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Contortionist Troupe",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 0,
  toughness: 0,
  text: `This creature enters with X +1/+1 counters on it.\n${COVEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "This creature enters with X +1/+1 counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      // An intervening-if: checked as it triggers and again as it resolves.
      condition: { kind: "coven" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COVEN_TEXT,
    },
  ],
});
