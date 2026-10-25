import { defineCard } from "../define.js";

// EDHREC rank 24162.

const TEXT = "{1}{W}, {T}, Discard a card: Create a 1/1 white Human Soldier creature token.";

export default defineCard({
  name: "Thraben Standard Bearer",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
