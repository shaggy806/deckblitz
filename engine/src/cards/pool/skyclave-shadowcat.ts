import { defineCard } from "../define.js";

// Rulings:
//   If Skyclave Shadowcat dies at the same time as another creature you control with a
//   +1/+1 counter on it, its last ability triggers for that creature.
//   If Skyclave Shadowcat has a +1/+1 counter on it and it dies, its last ability triggers.

export default defineCard({
  name: "Skyclave Shadowcat",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Cat", "Horror"],
  power: 3,
  toughness: 3,
  text: "{1}{B}, Sacrifice another creature: Put a +1/+1 counter on this creature.\nWhenever a creature you control with a +1/+1 counter on it dies, draw a card.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{1}{B}, Sacrifice another creature: Put a +1/+1 counter on this creature.",
      otherOnly: true,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control with a +1/+1 counter on it dies, draw a card.",
    },
  ],
});
