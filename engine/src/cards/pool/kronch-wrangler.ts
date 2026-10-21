import { defineCard } from "../define.js";

const TEXT = "Whenever a creature you control with power 4 or greater enters, put a +1/+1 counter on this creature.";

// The power is read as the creature enters, statics included (the rulings).
export default defineCard({
  name: "Kronch Wrangler",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "gte", n: 4 } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
