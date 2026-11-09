import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your end step, if you control a creature, look at the top seven cards of your library. Then you may sacrifice a creature. If you do, you may put a creature card with mana value X or less from among those cards onto the battlefield, where X is 1 plus the sacrificed creature's mana value. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Birthing Ritual",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "controls", filter: { type: "creature" }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "look-and-choose", zone: "library", count: 7, min: 0, max: 0, destination: "hand", leftover: "stay" },
          {
            kind: "each-player-may",
            who: "you",
            options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
            ifDid: {
              kind: "look-and-choose",
              zone: "library",
              count: 7,
              min: 0,
              max: 1,
              filter: {
                type: "creature",
                manaValue: { op: "lte", n: { amount: { sum: [1, { manaValueOf: { paid: "sacrificed" } }] } } },
              },
              destination: "battlefield",
              leftover: "bottom-random",
            },
            ifDidnt: { kind: "look-and-choose", zone: "library", count: 7, min: 0, max: 0, destination: "hand", leftover: "bottom-random" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
