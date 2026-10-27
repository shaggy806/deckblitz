import { defineCard } from "../define.js";

// EDHREC rank 18081.

const TEXT = "{U}, {T}, Discard a card: Return target creature to its owner's hand.";

export default defineCard({
  name: "Waterfront Bouncer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
