import { defineCard } from "../define.js";

export default defineCard({
  name: "Aven Surveyor",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Scout"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, choose one —\n• Put a +1/+1 counter on this creature.\n• Return target creature to its owner's hand.",
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
          {
            text: "Return target creature to its owner's hand.",
            targets: ["creature"],
            effect: { kind: "return-to-hand", target: 0 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
