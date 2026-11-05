import { defineCard } from "../define.js";

// EDHREC rank 23177. Holding only one card, they exile that one (its ruling).

export default defineCard({
  name: "Aim for the Head",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one —\n• Exile target Zombie.\n• Target opponent exiles two cards from their hand.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Exile target Zombie.",
        targets: [{ kind: "permanent", filter: { subtype: "Zombie" } }],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: "Target opponent exiles two cards from their hand.",
        targets: ["opponent"],
        effect: {
          kind: "for-each-player",
          who: { target: 0 },
          effect: {
            kind: "look-and-choose",
            player: "that-player",
            zone: "hand",
            min: 2,
            max: 2,
            destination: "exile",
            unlinked: true,
            leftover: "stay",
          },
        },
      },
    ],
  },
});
