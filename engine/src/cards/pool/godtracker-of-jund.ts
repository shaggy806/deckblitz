import { defineCard } from "../define.js";

// EDHREC rank 29697. Kronch Wrangler's trigger, optional.

const TEXT =
  "Whenever a creature you control with power 5 or greater enters, you may put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Godtracker of Jund",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", power: { op: "gte", n: 5 } } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Godtracker of Jund?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
