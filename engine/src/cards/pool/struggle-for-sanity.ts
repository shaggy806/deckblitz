import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 27004.
//
// A `repeat` while the hand holds a card: each pass the opponent exiles a
// card of their choice from it (an `as-player` of them around a
// `discard-chosen` `destination: "exile"`, so each card they pick is one
// *they* exiled — `exiledByPlayer`), then you exile one of your choice from
// it (the hand shown each time; it was revealed already). An empty hand ends
// the pass early, and the process. Once it's done, the cards they exiled go
// back to their hand (`move-exiled-this-way` `exiledBy`) and the rest — the
// ones you exiled, still in exile — to their graveyard.
const TEXT =
  "Target opponent reveals their hand. That player exiles a card from it, then you exile a card from it. Repeat this process until all cards in that hand have been exiled. That player returns the cards they exiled this way to their hand and puts the rest into their graveyard.";

export default defineCard({
  name: "Struggle for Sanity",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-hand", who: 0 },
      {
        kind: "repeat",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "as-player",
              who: { target: 0 },
              effect: { kind: "discard-chosen", target: 0, destination: "exile", unlinked: true },
            },
            { kind: "discard-chosen", target: 0, destination: "exile", unlinked: true },
          ],
        },
        again: { kind: "amounts", left: { cardsInHand: { target: 0 } }, op: "gt", right: 0 },
      },
      { kind: "move-exiled-this-way", to: "hand", exiledBy: { target: 0 } },
      { kind: "move-exiled-this-way", to: "graveyard" },
    ],
  },
});
