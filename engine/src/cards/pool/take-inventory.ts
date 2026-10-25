import { defineCard } from "../define.js";

// EDHREC rank 31399. Frantic Inventory's shape: the resolving copy is on the
// stack, not in the graveyard, so it doesn't count itself (the ruling).
export default defineCard({
  name: "Take Inventory",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw a card, then draw cards equal to the number of cards named Take Inventory in your graveyard.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      { kind: "draw", amount: { countInGraveyard: { name: "Take Inventory", ownedBy: "you" } } },
    ],
  },
});
