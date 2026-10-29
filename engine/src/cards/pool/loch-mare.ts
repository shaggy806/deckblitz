import { defineCard } from "../define.js";

// EDHREC rank 14725.

export default defineCard({
  name: "Loch Mare",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Horse", "Serpent"],
  power: 4,
  toughness: 5,
  text: "This creature enters with three -1/-1 counters on it.\n{1}{U}, Remove a counter from this creature: Draw a card.\n{2}{U}, Remove two counters from this creature: Tap target creature. Put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 3 } },
      text: "This creature enters with three -1/-1 counters on it.",
    },
  ],
  activated: [
    {
      // A counter of any kind it has, chosen as the cost is paid.
      cost: { mana: "{1}{U}", tap: false, removeCounter: { kind: "any", count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}{U}, Remove a counter from this creature: Draw a card.",
    },
    {
      cost: { mana: "{2}{U}", tap: false, removeCounter: { kind: "any", count: 2 } },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: "{2}{U}, Remove two counters from this creature: Tap target creature. Put a stun counter on it.",
    },
  ],
});
