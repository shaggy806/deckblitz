import { defineCard } from "../define.js";

// A modal double-faced card (sorcery // land): its back face, Sea Gate,
// Reborn, is a land you play instead. With no cards in hand it draws one (its
// ruling): the hand is counted as it resolves.
export default defineCard({
  name: "Sea Gate Restoration",
  manaCost: "{4}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw cards equal to the number of cards in your hand plus one. You have no maximum hand size for the rest of the game.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: { sum: [{ cardsInHand: "you" }, 1] } },
      { kind: "player-effect", duration: "permanent", noMaxHandSize: "you" },
    ],
  },
  faces: ["Sea Gate Restoration", "Sea Gate, Reborn"],
});
