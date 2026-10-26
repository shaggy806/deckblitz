import { defineCard } from "../define.js";

// EDHREC rank 9266.

export default defineCard({
  name: "Glasses of Urza",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Look at target player's hand.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: { kind: "look-at-hand", target: 0 },
      resolve: null,
      text: "{T}: Look at target player's hand.",
    },
  ],
});
