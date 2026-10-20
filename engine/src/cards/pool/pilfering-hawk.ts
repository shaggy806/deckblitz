import { defineCard } from "../define.js";

// EDHREC rank 19813.
const TEXT = "{S}, {T}: Draw a card, then discard a card.";

export default defineCard({
  name: "Pilfering Hawk",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT} ({S} can be paid with one mana from a snow source.)`,
  activated: [
    {
      cost: { mana: "{S}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
