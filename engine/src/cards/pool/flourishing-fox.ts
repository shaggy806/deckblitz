import { defineCard } from "../define.js";

// EDHREC rank 12688.

export default defineCard({
  name: "Flourishing Fox",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox"],
  power: 1,
  toughness: 1,
  cycling: { cost: "{1}" },
  text: "Whenever you cycle another card, put a +1/+1 counter on this creature.\nCycling {1} ({1}, Discard this card: Draw a card.)",
  triggered: [
    {
      trigger: { on: "cycles", who: "you", otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you cycle another card, put a +1/+1 counter on this creature.",
    },
  ],
});
