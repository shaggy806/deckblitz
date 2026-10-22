import { defineCard } from "../define.js";

export default defineCard({
  name: "Supreme Will",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Counter target spell unless its controller pays {3}.\n• Look at the top four cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter target spell unless its controller pays {3}.",
        targets: ["spell"],
        effect: { kind: "unless", chooser: 0, options: [{ pay: "{3}", text: "Pay {3}" }], otherwise: { kind: "counter", target: 0 } },
      },
      {
        text: "Look at the top four cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: 4,
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "bottom-any-order",
        },
      },
    ],
  },
});
