import { defineCard } from "../define.js";

// Whether it's suspected is checked as the ability resolves.

const TEXT = "{2}{B}: If this creature is suspected, put a +1/+1 counter on it. Otherwise, suspect it.";

export default defineCard({
  name: "Repeat Offender",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 2,
  toughness: 1,
  text: `${TEXT} (A suspected creature has menace and can't block.)`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { suspected: true } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        else: { kind: "suspect", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
