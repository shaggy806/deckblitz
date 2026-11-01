import { defineCard } from "../define.js";

// The hand and the library's top card revealed together, one card of them
// chosen, and that card put on the bottom of its owner's library.
const TEXT =
  "Target player reveals their hand and the top card of their library. You choose a card revealed this way. " +
  "That player puts the chosen card on the bottom of their library.";
const MADNESS =
  "Madness {1}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or " +
  "put it into your graveyard.)";

export default defineCard({
  name: "Psychotic Episode",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  madness: { cost: "{1}{B}" },
  text: `${TEXT}\n${MADNESS}`,
  targets: ["player"],
  effect: {
    kind: "discard-chosen",
    target: 0,
    destination: "library-bottom",
    alsoFrom: { zone: "library-top" },
  },
});
