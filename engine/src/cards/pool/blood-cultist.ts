import { defineCard } from "../define.js";

// EDHREC rank 17349.

export default defineCard({
  name: "Blood Cultist",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{T}: This creature deals 1 damage to target creature.\nWhenever a creature dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to target creature.",
    },
  ],
  triggered: [
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
