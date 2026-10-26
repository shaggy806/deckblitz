import { defineCard } from "../define.js";

// EDHREC rank 16824.
//
// Clash (rule 701.30): the `clash` effect, its win the counter.

export default defineCard({
  name: "Paperfin Rascal",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, clash with an opponent. If you win, put a +1/+1 counter on this creature. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "clash", won: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } },
      resolve: null,
      text: "When this creature enters, clash with an opponent. If you win, put a +1/+1 counter on this creature.",
    },
  ],
});
