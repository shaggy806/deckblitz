import { defineCard } from "../define.js";

// EDHREC rank 22393.
//
// The dies trigger reads each creature's toughness as it last existed on the
// battlefield, so it fires for Kheru Bloodsucker itself once it's 4 or more
// (the ruling).

const DRAIN =
  "Whenever a creature you control with toughness 4 or greater dies, each opponent loses 2 life and you gain 2 life.";
const SAC = "{2}{B}, Sacrifice another creature: Put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Kheru Bloodsucker",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 2,
  text: `${DRAIN}\n${SAC}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", toughness: { op: "gte", n: 4 } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: DRAIN,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: SAC,
      otherOnly: true,
    },
  ],
});
