import { defineCard } from "../define.js";

// EDHREC rank 24437.

const TEXT = "When this creature enters or dies, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Reputable Merchant",
  manaCost: "{2/W}{2/B}{2/G}",
  colors: ["W", "B", "G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
