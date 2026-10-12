import { defineCard } from "../define.js";

export default defineCard({
  name: "Haazda Vigilante",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 4,
  toughness: 4,
  text: "Whenever this creature enters or attacks, put a +1/+1 counter on target creature you control with power 2 or less.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { type: "creature", power: { op: "lte", n: 2 } },
        },
      ],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature enters or attacks, put a +1/+1 counter on target creature you control with power 2 or less.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { type: "creature", power: { op: "lte", n: 2 } },
        },
      ],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature enters or attacks, put a +1/+1 counter on target creature you control with power 2 or less.",
    },
  ],
});
