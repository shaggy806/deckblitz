import { defineCard } from "../define.js";

// EDHREC rank 24693. The intervening "if" (rule 603.4) is Homicidal Brute's.
const END = "At the beginning of your end step, if this creature didn't attack this turn, put a +1/+1 counter on it.";

export default defineCard({
  name: "Air Nomad Student",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${END}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "source", filter: { attackedThisTurn: false } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: END,
    },
  ],
});
