import { defineCard } from "../define.js";

const TEXT = "Whenever one or more +1/+1 counters are put on another creature you control, you may put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Enduring Scalelord",
  manaCost: "{4}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-put", who: "you-control", counter: "+1/+1", filter: { type: "creature", isSource: false } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Enduring Scalelord?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
