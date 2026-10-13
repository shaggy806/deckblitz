import { defineCard } from "../define.js";

// EDHREC rank 7178.
//
// X is chosen as it's cast (rule 107.3a), whichever mode; "twice {X}" is
// 2X generic, paid or not by the countered spell's controller.

export default defineCard({
  name: "Thassa's Intervention",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Look at the top X cards of your library. Put up to two of them into your hand and the rest on the bottom of your library in a random order.\n• Counter target spell unless its controller pays twice {X}.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Look at the top X cards of your library. Put up to two of them into your hand and the rest on the bottom of your library in a random order.",
        targets: [],
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: "x",
          min: 0,
          max: 2,
          destination: "hand",
          leftover: "bottom-random",
        },
      },
      {
        text: "Counter target spell unless its controller pays twice {X}.",
        targets: ["spell"],
        effect: {
          kind: "unless",
          chooser: 0,
          options: [{ payGeneric: { product: [2, "x"] }, text: "Pay twice {X}." }],
          otherwise: { kind: "counter", target: 0 },
        },
      },
    ],
  },
});
