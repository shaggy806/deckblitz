import { defineCard } from "../define.js";

// EDHREC rank 15133.

const PROTOCOLS_TEXT =
  "Guardian Protocols — {3}{B}, Sacrifice this creature: Return all legendary creature cards from your graveyard to your hand.";

export default defineCard({
  name: "Lychguard",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron"],
  power: 2,
  toughness: 3,
  text: PROTOCOLS_TEXT,
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        filter: { type: "creature", supertype: "legendary" },
        destination: "hand",
        count: "all",
      },
      resolve: null,
      text: PROTOCOLS_TEXT,
    },
  ],
});
