import { defineCard } from "../define.js";

// EDHREC rank 26866.

export default defineCard({
  name: "Wojek Bodyguard",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: "Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)\nThis creature can't attack or block alone.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "permanent",
          filter: {
            type: "creature",
            attacking: true,
            power: { op: "lt", n: { amount: { powerOf: "source" } } },
          },
        },
      ],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack-alone", "cant-block-alone"],
      text: "This creature can't attack or block alone.",
    },
  ],
});
