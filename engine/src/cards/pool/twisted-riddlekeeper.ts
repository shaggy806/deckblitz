import { defineCard } from "../define.js";

// EDHREC rank 20107. Modern Horizons 3.

export default defineCard({
  name: "Twisted Riddlekeeper",
  manaCost: "{8}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  alternativeCost: { mana: "{5}{C}{U}", keyword: "emerge", emerge: { filter: { type: "creature" } } },
  text: "Emerge {5}{C}{U} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\nWhen you cast this spell, tap up to two target permanents. Put a stun counter on each of them. (If a permanent with a stun counter would become untapped, remove one from it instead.)\nFlying",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [
        { kind: "optional", of: "permanent" },
        { kind: "optional", of: { kind: "other", of: "permanent", than: { slot: 0 } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          { kind: "add-counter", target: 1, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: "When you cast this spell, tap up to two target permanents. Put a stun counter on each of them.",
    },
  ],
});
