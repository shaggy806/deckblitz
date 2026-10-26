import { defineCard } from "../define.js";

// EDHREC rank 29427.

export default defineCard({
  name: "Pegasus Refuge",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "{2}, Discard a card: Create a 1/1 white Pegasus creature token with flying.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Pegasus Token", count: 1 },
      resolve: null,
      text: "{2}, Discard a card: Create a 1/1 white Pegasus creature token with flying.",
    },
  ],
});
