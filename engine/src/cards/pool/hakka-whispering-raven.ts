import { defineCard } from "../define.js";

// The back face of Alrund, God of the Cosmos.
const RETURN_TEXT = "Whenever Hakka deals combat damage to a player, return it to its owner's hand, then scry 2.";

export default defineCard({
  name: "Hakka, Whispering Raven",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${RETURN_TEXT}`,
  faces: ["Alrund, God of the Cosmos", "Hakka, Whispering Raven"],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: "source" },
          { kind: "scry", amount: 2 },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
