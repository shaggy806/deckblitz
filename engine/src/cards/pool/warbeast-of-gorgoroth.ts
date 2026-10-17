import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature or another creature you control with power 4 or greater dies, amass Orcs 2. (Put two +1/+1 counters on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)";
const AMASS = { kind: "amass", amount: 2, creatureType: "Orc" } as const;

// Ruling: dying alongside other such creatures, it triggers once for each.
// The other creature's power is read as it last existed (rule 603.10a).
export default defineCard({
  name: "Warbeast of Gorgoroth",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: AMASS,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", power: { op: "gte", n: 4 } },
        otherOnly: true,
      },
      sameAbilityAs: 0,
      targets: [],
      effect: AMASS,
      resolve: null,
      text: TEXT,
    },
  ],
});
