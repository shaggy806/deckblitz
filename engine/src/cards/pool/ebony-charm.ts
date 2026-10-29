import { defineCard } from "../define.js";

// EDHREC rank 19365.

export default defineCard({
  name: "Ebony Charm",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose one —\n• Target opponent loses 1 life and you gain 1 life.\n• Exile up to three target cards from a single graveyard.\n• Target creature gains fear until end of turn. (It can't be blocked except by artifact creatures and/or black creatures.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target opponent loses 1 life and you gain 1 life.",
        targets: ["opponent"],
        effect: {
          kind: "sequence",
          effects: [{ kind: "lose-life", amount: 1, target: 0 }, { kind: "gain-life", amount: 1 }],
        },
      },
      {
        text: "Exile up to three target cards from a single graveyard.",
        targets: [
          {
            kind: "any-number",
            of: { kind: "card-in-graveyard", whose: "any" },
            max: 3,
            sameController: true,
          },
        ],
        effect: {
          kind: "for-each-target",
          from: 0,
          simultaneous: true,
          effect: { kind: "exile", target: 0 },
        },
      },
      {
        text: "Target creature gains fear until end of turn.",
        targets: ["creature"],
        effect: { kind: "grant-keyword", target: 0, keyword: "fear", duration: "end-of-turn" },
      },
    ],
  },
});
