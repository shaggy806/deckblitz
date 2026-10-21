import { defineCard } from "../define.js";

// EDHREC rank 24005.

export default defineCard({
  name: "Parhelion Patrol",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: "Flying\nVigilance (Attacking doesn't cause this creature to tap.)\nMentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)",
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
