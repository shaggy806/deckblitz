import { defineCard } from "../define.js";

// EDHREC rank 29292.

export default defineCard({
  name: "Sandcrafter Mage",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, bolster 1. (Choose a creature with the least toughness among creatures you control and put a +1/+1 counter on it.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "bolster", amount: 1 },
      resolve: null,
      text: "When this creature enters, bolster 1.",
    },
  ],
});
