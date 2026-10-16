import { defineCard } from "../define.js";

// EDHREC rank 7674.

export default defineCard({
  name: "Confounding Riddle",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Look at the top four cards of your library. Put one of them into your hand and the rest into your graveyard.\n• Counter target spell unless its controller pays {4}.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Look at the top four cards of your library. Put one of them into your hand and the rest into your graveyard.",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: 4,
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "graveyard",
        },
      },
      {
        text: "Counter target spell unless its controller pays {4}.",
        targets: ["spell"],
        effect: { kind: "unless", chooser: 0, options: [{ pay: "{4}", text: "Pay {4}" }], otherwise: { kind: "counter", target: 0 } },
      },
    ],
  },
});
