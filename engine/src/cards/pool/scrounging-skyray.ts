import { defineCard } from "../define.js";

// EDHREC rank 7269.

const DISCARD_TEXT = "Whenever you discard one or more cards, put that many +1/+1 counters on this creature.";

export default defineCard({
  name: "Scrounging Skyray",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish", "Pirate"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  cycling: { cost: "{2}" },
  text: `Flying\n${DISCARD_TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  triggered: [
    {
      // Marauding Mako's batched discard trigger: the trigger value is how
      // many were discarded.
      trigger: { on: "discards", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
