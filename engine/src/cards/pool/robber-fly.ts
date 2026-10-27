import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 28248.
//
// Rulings:
//   It triggers only once even if blocked by more than one creature.
//
// "Defending player" is the becomes-blocked event's player (`"trigger-player"`), as on Slate
// Street Ruffian; Barbed Shocker's discard-then-draw-that-many.

const TEXT =
  "Whenever this creature becomes blocked, defending player discards all the cards in their hand, then draws that many cards.";

export default defineCard({
  name: "Robber Fly",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "trigger-player" },
          { kind: "draw", who: "trigger-player", amount: { thisWay: "discarded" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
