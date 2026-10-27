import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 31452.

const TEXT =
  "{W}{W}: Create a 1/1 white Soldier creature token. Activate only if you control no creatures and only once each turn.";

export default defineCard({
  name: "Security Detail",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      condition: { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 1 } },
      oncePerTurn: true,
      text: TEXT,
    },
  ],
});
