import { defineCard } from "../define.js";

// EDHREC rank 21958.

export default defineCard({
  name: "Apprentice Sharpshooter",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 1,
  toughness: 4,
  keywords: ["reach"],
  text: "Reach\nTraining (Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self", withGreaterPower: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1, training: true },
      resolve: null,
      text: "Training",
    },
  ],
});
