import { defineCard } from "../define.js";

export default defineCard({
  name: "Trufflesnout",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, choose one —\n• Put a +1/+1 counter on this creature.\n• You gain 4 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put a +1/+1 counter on this creature.",
            effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
          { text: "You gain 4 life.", effect: { kind: "gain-life", amount: 4 } },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —\n• Put a +1/+1 counter on this creature.\n• You gain 4 life.",
    },
  ],
});
