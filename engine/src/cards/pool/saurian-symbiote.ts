import { defineCard } from "../define.js";

// EDHREC rank 20803. Apothecary Stomper's modal enters trigger.

export default defineCard({
  name: "Saurian Symbiote",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Dinosaur"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\nWhen this creature enters, choose one —\n• Put a +1/+1 counter on this creature.\n• Create a 1/1 green Saproling creature token.",
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
            text: "Create a 1/1 green Saproling creature token.",
            effect: { kind: "create-token", token: "Saproling Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
