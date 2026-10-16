import { defineCard } from "../define.js";

// EDHREC rank 16324.

// "Activate only ... once" is once for as long as the object exists — the
// `exhaust` bookkeeping, cleared by a zone change (Haunted Screen's shape);
// threshold is the activation condition.
const TEXT =
  "Threshold — {1}{U}: Put a +1/+1 counter on this creature and draw a card. Activate only if there are seven or more cards in your graveyard and only once.";

export default defineCard({
  name: "Thought Shucker",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Rat", "Rogue"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      condition: { kind: "threshold" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
      exhaust: true,
    },
  ],
});
