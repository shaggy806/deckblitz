import { defineCard } from "../define.js";

const TEXT =
  "Whenever The Roaring Toeclaws or another creature you control with mana value five or greater becomes untapped, put +1/+1 counters on it equal to its power.";

export default defineCard({
  name: "The Roaring Toeclaws",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      // The Roaring Toeclaws has mana value 5, so the one filter covers both halves.
      trigger: {
        on: "event",
        event: "becomes-untapped",
        who: "you-control",
        filter: { type: "creature", manaValue: { op: "gte", n: 5 } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: { powerOf: "trigger-object" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
