import { defineCard } from "../define.js";

// EDHREC rank 14838. The loyalty counter is put on, not a loyalty ability
// activated (the ruling).

export default defineCard({
  name: "Jace's Projection",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wizard", "Illusion"],
  power: 2,
  toughness: 2,
  text: "Whenever you draw a card, put a +1/+1 counter on this creature.\n{3}{U}: Put a loyalty counter on target Jace planeswalker.",
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you draw a card, put a +1/+1 counter on this creature.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "planeswalker", subtype: "Jace" } }],
      effect: { kind: "add-counter", target: 0, counter: "loyalty", amount: 1 },
      resolve: null,
      text: "{3}{U}: Put a loyalty counter on target Jace planeswalker.",
    },
  ],
});
