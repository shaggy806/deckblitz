import { defineCard } from "../define.js";

const TEXT = "Each player reveals their hand, chooses one card of each color from it, then discards all other nonland cards.";

/** A land can be chosen (Dryad Arbor is green) and is never discarded; a
 * colorless card can't be chosen and goes unless it's a land. */
export default defineCard({
  name: "Noxious Vapors",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-hand", who: "each-player" },
      {
        kind: "choose-one-of-each",
        who: "each-player",
        slots: "colors",
        filter: {},
        fromHand: true,
        rest: { discard: { notTypes: ["land"] } },
        prompt: "Choose one card of each color — your other nonland cards are discarded",
      },
    ],
  },
});
