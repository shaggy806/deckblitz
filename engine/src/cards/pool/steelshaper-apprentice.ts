import { defineCard } from "../define.js";

// Darksteel. EDHREC rank 20632. Steelshaper's Gift's search, behind a cost
// that returns the creature itself to its owner's hand.

const TEXT =
  "{W}, {T}, Return this creature to its owner's hand: Search your library for an Equipment card, reveal that card, put it into your hand, then shuffle.";

export default defineCard({
  name: "Steelshaper Apprentice",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: true, returnSelfToHand: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Equipment" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
