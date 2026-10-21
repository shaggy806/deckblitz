import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] If a spell or ability causes you to put a card into your hand without
//     specifically using the word "draw," it's not a card drawn.
//   [2020-06-23] While resolving Tolarian Kraken's ability, you can't pay more than {1} to tap or
//     untap more than one creature.

export default defineCard({
  name: "Tolarian Kraken",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 4,
  toughness: 6,
  text: "Whenever you draw a card, you may pay {1}. When you do, you may tap or untap target creature.",
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to tap or untap target creature?",
        cost: "{1}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          // "You may tap or untap" — Retreat to Coralhelm's shape.
          effect: {
            kind: "modal",
            minModes: 0,
            maxModes: 1,
            modes: [
              { effect: { kind: "tap", target: 0 }, text: "Tap target creature." },
              { effect: { kind: "untap", target: 0 }, text: "Untap target creature." },
            ],
          },
          text: "When you do, you may tap or untap target creature.",
        },
      },
      resolve: null,
      text: "Whenever you draw a card, you may pay {1}. When you do, you may tap or untap target creature.",
    },
  ],
});
