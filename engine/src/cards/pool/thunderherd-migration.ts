import { defineCard } from "../define.js";

// EDHREC rank 5523.

export default defineCard({
  name: "Thunderherd Migration",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  additionalCost: {
    options: [
      {
        text: "Reveal a Dinosaur card",
        behold: { filter: { subtype: "Dinosaur" }, text: "a Dinosaur card", fromHand: true },
      },
      { text: "Pay {1}", mana: "{1}" },
    ],
  },
  text: "As an additional cost to cast this spell, reveal a Dinosaur card from your hand or pay {1}.\nSearch your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "battlefield",
    min: 0,
    max: 1,
    enterTapped: true,
  },
});
