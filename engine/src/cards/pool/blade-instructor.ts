import { defineCard } from "../define.js";

// EDHREC rank 25341.

export default defineCard({
  name: "Blade Instructor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 1,
  text: "Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)",
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
