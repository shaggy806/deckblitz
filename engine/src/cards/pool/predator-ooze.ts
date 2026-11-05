import { defineCard } from "../define.js";

// EDHREC rank 6278.

export default defineCard({
  name: "Predator Ooze",
  manaCost: "{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 1,
  toughness: 1,
  keywords: ["indestructible"],
  text: "Indestructible (Damage and effects that say \"destroy\" don't destroy this creature.)\nWhenever this creature attacks, put a +1/+1 counter on it.\nWhenever a creature dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature attacks, put a +1/+1 counter on it.",
    },
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", damagedThisTurnBy: { source: "this" } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a creature dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.",
    },
  ],
});
