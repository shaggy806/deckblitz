import { defineCard } from "../define.js";

// EDHREC rank 16607. Machinesmith Automaton's trigger, with Emiel's "you may
// pay. If you do".

const TEXT =
  "Whenever another artifact you control enters, you may pay {1}. If you do, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Oreplate Pangolin",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Pangolin"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to put a +1/+1 counter on this creature?",
        cost: "{1}",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
