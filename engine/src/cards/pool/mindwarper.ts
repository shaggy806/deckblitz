import { defineCard } from "../define.js";

// EDHREC rank 30989.

export default defineCard({
  name: "Mindwarper",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  text: "This creature enters with three +1/+1 counters on it.\n{2}{B}, Remove a +1/+1 counter from this creature: Target player discards a card. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 1 },
      resolve: null,
      text: "{2}{B}, Remove a +1/+1 counter from this creature: Target player discards a card. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "This creature enters with three +1/+1 counters on it.",
    },
  ],
});
