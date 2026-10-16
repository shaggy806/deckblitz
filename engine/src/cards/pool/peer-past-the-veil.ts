import { defineCard } from "../define.js";

// EDHREC rank 12299.
// X is counted as the spell resolves, after the discard; the spell is still
// on the stack, so it doesn't count itself (the ruling).
export default defineCard({
  name: "Peer Past the Veil",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Discard your hand. Then draw X cards, where X is the number of card types among cards in your graveyard.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "you" },
      { kind: "draw", amount: { cardTypesInGraveyard: { ownedBy: "you" } } },
    ],
  },
});
