import { defineCard } from "../define.js";

// EDHREC rank 11130.

export default defineCard({
  name: "Banewhip Punisher",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, you may put a -1/-1 counter on target creature.\n{B}, Sacrifice this creature: Destroy target creature that has a -1/-1 counter on it.",
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", counters: { kind: "-1/-1", compare: { op: "gte", n: 1 } } },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{B}, Sacrifice this creature: Destroy target creature that has a -1/-1 counter on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Put a -1/-1 counter on target creature?",
        effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      },
      resolve: null,
      text: "When this creature enters, you may put a -1/-1 counter on target creature.",
    },
  ],
});
