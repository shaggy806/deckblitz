import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 9163.

const TEXT = "{3}, {T}, Sacrifice this artifact: Return all enchantment cards from your graveyard to your hand.";

export default defineCard({
  name: "Crystal Chimes",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "return-from-graveyard", filter: { type: "enchantment" }, destination: "hand", count: "all" },
      resolve: null,
      text: TEXT,
    },
  ],
});
