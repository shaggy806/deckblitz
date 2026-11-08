import { defineCard } from "../define.js";

// EDHREC rank 28315. Cast, the card has left exile: a new object the delayed
// return can't reach (rule 400.7), and so "if you haven't cast the card"
// (Planeswalker's Mischief's reasoning). With no card chosen, no delayed
// ability is set up.

export default defineCard({
  name: "Psychic Theft",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player reveals their hand. You choose an instant or sorcery card from it and exile that card. You may cast that card for as long as it remains exiled. At the beginning of the next end step, if you haven't cast the card, return it to its owner's hand.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "discard-chosen",
        target: 0,
        filter: { typesAnyOf: ["instant", "sorcery"] },
        destination: "exile",
        mayPlay: { duration: "while-exiled" },
      },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        about: "exiled",
        text: "If you haven't cast the card, return it to its owner's hand.",
        effect: { kind: "return-to-hand", target: 0, from: "exile" },
      },
    ],
  },
});
