import { defineCard } from "../define.js";

// EDHREC rank 24079.

export default defineCard({
  name: "Barging Sergeant",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Soldier"],
  power: 4,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nMentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)",
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
