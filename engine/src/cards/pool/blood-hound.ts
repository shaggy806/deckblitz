import { defineCard } from "../define.js";

const DAMAGE = "Whenever you're dealt damage, you may put that many +1/+1 counters on this creature.";
const END = "At the beginning of your end step, remove all +1/+1 counters from this creature.";

export default defineCard({
  name: "Blood Hound",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 1,
  toughness: 1,
  text: `${DAMAGE}\n${END}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put that many +1/+1 counters on Blood Hound?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      },
      resolve: null,
      text: DAMAGE,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "remove-counter",
        target: "source",
        counter: "+1/+1",
        amount: { countersOn: "source", counter: "+1/+1" },
      },
      resolve: null,
      text: END,
    },
  ],
});
