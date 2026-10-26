import { defineCard } from "../define.js";

const TEXT = "Whenever this creature becomes tapped, you may put a +1/+1 counter on it.";

export default defineCard({
  name: "Veteran of the Depths",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Veteran of the Depths?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
