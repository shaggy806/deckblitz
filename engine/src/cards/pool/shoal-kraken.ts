import { defineCard } from "../define.js";

// Skyswimmer Koi's loot, on constellation.
const CONSTELLATION_TEXT =
  "Constellation — Whenever an enchantment you control enters, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Shoal Kraken",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 3,
  toughness: 5,
  text: CONSTELLATION_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "drawn", who: "you" },
              then: { kind: "discard", target: "you", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: CONSTELLATION_TEXT,
    },
  ],
});
