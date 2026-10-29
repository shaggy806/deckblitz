import { defineCard } from "../define.js";

// EDHREC rank 3138.

export default defineCard({
  name: "Power Conduit",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{T}, Remove a counter from a permanent you control: Choose one —\n• Put a charge counter on target artifact.\n• Put a +1/+1 counter on target creature.",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "any", count: 1, from: {} } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put a charge counter on target artifact.",
            targets: ["artifact"],
            effect: { kind: "add-counter", target: 0, counter: "charge", amount: 1 },
          },
          {
            text: "Put a +1/+1 counter on target creature.",
            targets: ["creature"],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "{T}, Remove a counter from a permanent you control: Choose one —",
    },
  ],
});
