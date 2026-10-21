import { defineCard } from "../define.js";

// EDHREC rank 19784.

export default defineCard({
  name: "Boros Challenger",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  text: "Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)\n{2}{R}{W}: This creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{2}{R}{W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{2}{R}{W}: This creature gets +1/+1 until end of turn.",
    },
  ],
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
});
