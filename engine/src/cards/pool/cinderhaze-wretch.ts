import { defineCard } from "../define.js";

// Ruling: the -1/-1 counter is a cost, put on as the ability is activated.

export default defineCard({
  name: "Cinderhaze Wretch",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 3,
  toughness: 2,
  text: "{T}: Target player discards a card. Activate only during your turn.\nPut a -1/-1 counter on this creature: Untap this creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 1 },
      resolve: null,
      text: "{T}: Target player discards a card. Activate only during your turn.",
      condition: { kind: "your-turn" },
    },
    {
      cost: { mana: null, tap: false, addCounter: { kind: "-1/-1", count: 1 } },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "Put a -1/-1 counter on this creature: Untap this creature.",
    },
  ],
});
