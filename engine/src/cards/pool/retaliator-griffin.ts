import { defineCard } from "../define.js";

const TEXT =
  "Whenever a source an opponent controls deals damage to you, you may put that many +1/+1 counters on this creature.";

export default defineCard({
  name: "Retaliator Griffin",
  manaCost: "{1}{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "opponent", to: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put that many +1/+1 counters on Retaliator Griffin?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
