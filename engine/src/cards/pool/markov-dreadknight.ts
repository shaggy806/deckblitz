import { defineCard } from "../define.js";

// EDHREC rank 23636.

const GROW_TEXT = "{2}{B}, Discard a card: Put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Markov Dreadknight",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${GROW_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
