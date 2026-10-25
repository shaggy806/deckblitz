import { defineCard } from "../define.js";

// X is counted as the ability resolves (the ruling); the bolstered creature
// needn't be one of the tapped ones.

const TEXT =
  "At the beginning of your end step, bolster X, where X is the number of tapped creatures you control. (Choose a creature with the least toughness among creatures you control and put X +1/+1 counters on it.)";

export default defineCard({
  name: "Dragonscale General",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "bolster", amount: { countOf: { type: "creature", controlledBy: "you", tapped: true } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
