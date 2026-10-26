import { defineCard } from "../define.js";

// EDHREC rank 10390. No cost to attack (the ruling): a creature attacks even
// with an empty library; its controller mills two as the trigger resolves.
const TEXT =
  "Whenever a creature attacks you or a planeswalker you control, that creature's controller mills two cards.";

export default defineCard({
  name: "Riddlekeeper",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 1,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackingYou: true },
      targets: [],
      effect: { kind: "mill", target: "trigger-controller", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
