import { defineCard } from "../define.js";

// EDHREC rank 18232.

export default defineCard({
  name: "Perfect Intimidation",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one or both —\n• Target opponent exiles two cards from their hand.\n• Remove all counters from target creature.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
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
      {
        text: "Remove all counters from target creature.",
        targets: ["creature"],
        effect: { kind: "remove-counter", target: 0, counter: "any", amount: "all" },
      },
    ],
  },
});
