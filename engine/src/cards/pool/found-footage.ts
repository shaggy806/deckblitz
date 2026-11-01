import { defineCard } from "../define.js";

// EDHREC rank 18428.
//
// Rulings:
//   Found Footage's first ability doesn't let you look at face-down spells you don't control on the
//     stack.
//   Found Footage's first ability lets you look at face-down creatures whenever you want, even if
//     you don't have priority. This action doesn't use the stack. Knowing what those cards are
//     becomes part of the information you have access to, just like you can look at the cards in
//     your hand.

const LOOK_TEXT = "You may look at face-down creatures your opponents control any time.";
const SURVEIL_TEXT =
  "{2}, Sacrifice this artifact: Surveil 2, then draw a card. (To surveil 2, look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)";

export default defineCard({
  name: "Found Footage",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Clue"],
  text: `${LOOK_TEXT}\n${SURVEIL_TEXT}`,
  static: [{ affects: { scope: "self" }, visibility: { looksAtFaceDownCreatures: true }, text: LOOK_TEXT }],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 2, then: { kind: "draw", amount: 1 } },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
});
