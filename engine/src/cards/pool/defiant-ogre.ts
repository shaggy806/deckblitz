import { defineCard } from "../define.js";

export default defineCard({
  name: "Defiant Ogre",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 5,
  text: "When this creature enters, choose one —\n• Put a +1/+1 counter on this creature.\n• Destroy target artifact.",
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
            text: "Destroy target artifact.",
            targets: ["artifact"],
            effect: { kind: "destroy", target: 0 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
