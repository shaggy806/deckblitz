import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 25308. A Spellshaper (discard a card as a cost).

const TEXT = "{1}{W}, {T}, Discard a card: Create two 1/1 white Citizen creature tokens.";

export default defineCard({
  name: "Icatian Crier",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "White Citizen Token", count: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
