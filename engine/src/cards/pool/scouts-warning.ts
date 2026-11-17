import { defineCard } from "../define.js";

// EDHREC rank 13482.
//
// Rulings:
//   You don't choose a creature card when Scout's Warning resolves. Rather, this sets up a rule
//     that is true for you until the turn ends or until you cast a creature card, even if you cast
//     that creature at a time you normally could.
//   If you cast multiple Scout's Warnings on the same turn, they'll all apply to the very next
//     creature spell you cast.
//   You cannot use this effect to play Dryad Arbor during an opponent's turn.
//   After Scout's Warning resolves, you can suspend a creature card in your hand any time you can
//     cast an instant. As soon as you actually cast a creature card, you lose this capability.
//
// Quicken's shape (`castAsThoughFlash` with `next`), for a creature card,
// with `play`: "play", not only "cast" — a land creature card (Dryad Arbor)
// may be played as though it had flash too (rule 702.8a), only on your own
// turn (305.3), and playing it uses the effect up. Suspend reads the same
// permission (702.62a: "if you could begin to cast this card").

const FLASH_TEXT = "The next creature card you play this turn can be played as though it had flash.";

export default defineCard({
  name: "Scout's Warning",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: `${FLASH_TEXT}\nDraw a card.`,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "player-effect",
        duration: "end-of-turn",
        castAsThoughFlash: { filter: { type: "creature" }, next: true, play: true },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
