import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 8939. Quiet Disrepair's announced upkeep
// mode choice, each mode with its own target.

export default defineCard({
  name: "Energy Chamber",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "At the beginning of your upkeep, choose one —\n• Put a +1/+1 counter on target artifact creature.\n• Put a charge counter on target noncreature artifact.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put a +1/+1 counter on target artifact creature.",
            targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
          {
            text: "Put a charge counter on target noncreature artifact.",
            targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
            effect: { kind: "add-counter", target: 0, counter: "charge", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, choose one —",
    },
  ],
});
