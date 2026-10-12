import { defineCard } from "../define.js";

export default defineCard({
  name: "Soul Read",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Counter target spell unless its controller pays {4}.\n• Draw two cards.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter target spell unless its controller pays {4}.",
        targets: ["spell"],
        effect: {
          kind: "unless",
          chooser: 0,
          options: [{ pay: "{4}", text: "Pay {4}" }],
          otherwise: { kind: "counter", target: 0 },
        },
      },
      { text: "Draw two cards.", effect: { kind: "draw", amount: 2 } },
    ],
  },
});
