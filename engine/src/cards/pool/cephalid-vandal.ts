import { defineCard } from "../define.js";

// Torment. EDHREC rank 21443.

const TEXT =
  "At the beginning of your upkeep, put a shred counter on this creature. Then mill a card for each shred counter on this creature.";

export default defineCard({
  name: "Cephalid Vandal",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus", "Rogue"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "shred", amount: 1 },
          { kind: "mill", target: "you", amount: { countersOn: "source", counter: "shred" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
