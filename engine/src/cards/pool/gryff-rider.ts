import { defineCard } from "../define.js";

// EDHREC rank 24622.

export default defineCard({
  name: "Gryff Rider",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nTraining (Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature.)",
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
