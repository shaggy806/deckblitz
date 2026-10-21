import { defineCard } from "../define.js";

// EDHREC rank 21774.

export default defineCard({
  name: "Sunhome Stalwart",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike (This creature deals combat damage before creatures without first strike.)\nMentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)",
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
