import { defineCard } from "../define.js";

const HAND_TEXT = "You have no maximum hand size.";
const DISCARD_TEXT =
  "If an effect causes you to discard a card, discard it, but you may put it on top of your library instead of into your graveyard.";

// Rulings:
//   You can look at a randomly discarded card before deciding where it goes.
//   The discard triggers anything else that triggers on discards.
//   You can't use the Library of Leng ability to place a discarded card on top of your library
//     when you discard a card as a cost, because costs aren't effects.
//   If more than one card is discarded due to a single effect, the Library allows you to decide
//     whether or not to use it on each of the cards. You get to decide the order the cards are
//     placed on the library if more than one goes there.
export default defineCard({
  name: "Library of Leng",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${HAND_TEXT}\n${DISCARD_TEXT}`,
  static: [
    { affects: { scope: "self" }, noMaxHandSize: true, text: HAND_TEXT },
    { affects: { scope: "self" }, replacement: { event: "would-discard", causedBy: "effect" }, text: DISCARD_TEXT },
  ],
});
