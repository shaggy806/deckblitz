import { defineCard } from "../define.js";

// EDHREC rank 25688.

export default defineCard({
  name: "Consider the Prime Directive",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Interfere — Counter target spell unless its controller pays {3}.\n• Observe — Tap up to one target creature and put a stun counter on it. Draw a card. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Interfere — Counter target spell unless its controller pays {3}.",
        targets: ["spell"],
        effect: { kind: "unless", chooser: 0, options: [{ pay: "{3}", text: "Pay {3}" }], otherwise: { kind: "counter", target: 0 } },
      },
      {
        text: "Observe — Tap up to one target creature and put a stun counter on it. Draw a card.",
        targets: [{ kind: "optional", of: "creature" }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: 0 },
            { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
            { kind: "draw", amount: 1 },
          ],
        },
      },
    ],
  },
});
