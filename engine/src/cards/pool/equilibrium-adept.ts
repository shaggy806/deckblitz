import { defineCard } from "../define.js";

// EDHREC rank 21074.
//
// Rulings:
//   [2025-04-04] Spells that were cast before a permanent with flurry count. If that permanent was
//     the first spell you cast that turn, the next spell you cast that turn is your second spell.
//   [2025-04-04] You pay all costs and follow all timing rules for cards played this way. For
//     example, if the exiled card is a land card, you may play it only during your main phase
//     while the stack is empty.

const ENTER_TEXT =
  "When this creature enters, exile the top card of your library. Until the end of your next turn, you may play that card.";
const FLURRY_TEXT =
  "Flurry — Whenever you cast your second spell each turn, this creature gains double strike until end of turn.";

export default defineCard({
  name: "Equilibrium Adept",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dog", "Monk"],
  power: 2,
  toughness: 4,
  text: `${ENTER_TEXT}\n${FLURRY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: FLURRY_TEXT,
    },
  ],
});
