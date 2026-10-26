import { defineCard } from "../define.js";

// EDHREC rank 26998. Warbeast of Gorgoroth's two-trigger shape.
//
// Rulings:
//   The other creature's power is read as it last existed (rule 603.10a).
//   Mycoid Shepherd's own death triggers it whatever its power.
//   Dying alongside another such creature, it triggers twice.

const TEXT = "Whenever this creature or another creature you control with power 5 or greater dies, you may gain 5 life.";
const GAIN = { kind: "may", prompt: "Gain 5 life?", effect: { kind: "gain-life", amount: 5 } } as const;

export default defineCard({
  name: "Mycoid Shepherd",
  manaCost: "{1}{G}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 5,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: GAIN,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", power: { op: "gte", n: 5 } },
        otherOnly: true,
      },
      sameAbilityAs: 0,
      targets: [],
      effect: GAIN,
      resolve: null,
      text: TEXT,
    },
  ],
});
