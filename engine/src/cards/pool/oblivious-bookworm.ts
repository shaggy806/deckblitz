import { defineCard } from "../define.js";

// "Entered face down" asks about it as it entered (`entered`'s snapshot).

export default defineCard({
  name: "Oblivious Bookworm",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: "At the beginning of your end step, you may draw a card. If you do, discard a card unless a permanent entered the battlefield face down under your control this turn or you turned a permanent face up this turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            {
              kind: "conditional",
              condition: {
                kind: "all",
                of: [
                  { kind: "this-way", what: "drawn", who: "you" },
                  {
                    kind: "not",
                    of: {
                      kind: "any",
                      of: [
                        { kind: "turn-history", what: "entered", filter: { faceDown: true } },
                        { kind: "turn-history", what: "turned-face-up" },
                      ],
                    },
                  },
                ],
              },
              then: { kind: "discard", target: "you", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: "At the beginning of your end step, you may draw a card. If you do, discard a card unless a permanent entered the battlefield face down under your control this turn or you turned a permanent face up this turn.",
    },
  ],
});
