import { defineCard } from "../define.js";

// EDHREC rank 31210.

export default defineCard({
  name: "Jett Reno, Problem Solver",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 2,
  text: "Whenever Jett Reno becomes tapped, surveil 1. If her power is 4 or greater, instead draw a card.\nWhenever you face a dilemma, put a +1/+1 counter on Jett Reno. (You face a dilemma as you choose one or more modes for a spell or ability.)",
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      // Her power as the trigger resolves (her last known power if she's gone).
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { power: { op: "gte", n: 4 } } },
        then: { kind: "draw", amount: 1 },
        else: { kind: "surveil", amount: 1 },
      },
      resolve: null,
      text: "Whenever Jett Reno becomes tapped, surveil 1. If her power is 4 or greater, instead draw a card.",
    },
    {
      trigger: { on: "faces-dilemma", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you face a dilemma, put a +1/+1 counter on Jett Reno.",
    },
  ],
});
