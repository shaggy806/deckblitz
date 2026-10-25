import { defineCard } from "../define.js";

const PROWESS = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const TEXT =
  "Whenever this creature attacks, you may return target creature to its owner's hand if its power is less than this creature's power.";

// The powers are compared as the ability resolves: any creature can be
// targeted, and it returns only if its power is then less.

export default defineCard({
  name: "Sage-Eye Avengers",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn", "Monk"],
  power: 4,
  toughness: 5,
  text: `${PROWESS}\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "conditional",
        condition: {
          kind: "target",
          index: 0,
          filter: { power: { op: "lt", n: { amount: { powerOf: "source" } } } },
        },
        then: {
          kind: "may",
          prompt: "Return target creature to its owner's hand?",
          effect: { kind: "return-to-hand", target: 0 },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
