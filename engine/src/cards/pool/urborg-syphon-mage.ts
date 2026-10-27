import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 21360. A Spellshaper: Scholar of Athreos's
// drain behind a discard. "Each other player" is each opponent (no teams).

const DRAIN_TEXT =
  "{2}{B}, {T}, Discard a card: Each other player loses 2 life. You gain life equal to the life lost this way.";

export default defineCard({
  name: "Urborg Syphon-Mage",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 2,
  toughness: 2,
  text: DRAIN_TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
