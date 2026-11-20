import { defineCard } from "../define.js";

// Mirage. EDHREC rank 16193.
//
// Out of the Tombs' shape without its empty-library condition: each draw
// becomes an effect (rule 614.1a), replaced though the library is empty
// (614.11) and one card at a time in a draw of several (614.11a, the ruling).
// With no card in the graveyard to choose, the player loses (the ruling).
// The graveyard replacement is Yawgmoth's Agenda's, cards only (a token isn't
// one), and exiles this enchantment itself too (the ruling).

const DRAW =
  "If you would draw a card, return a card from your graveyard to your hand instead. If you can't, you lose the game.";
const EXILE = "If a card would be put into your graveyard from anywhere, exile that card instead.";

export default defineCard({
  name: "Forbidden Crypt",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${DRAW}\n${EXILE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        instead: {
          effect: {
            kind: "conditional",
            condition: { kind: "cards-in-graveyard", atLeast: 1 },
            then: { kind: "return-from-graveyard", filter: {}, destination: "hand", count: 1 },
            else: { kind: "lose-game" },
          },
        },
      },
      text: DRAW,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", filter: { ownedBy: "you", token: false } },
      text: EXILE,
    },
  ],
});
