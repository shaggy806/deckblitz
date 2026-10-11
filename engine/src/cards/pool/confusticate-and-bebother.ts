import { defineCard } from "../define.js";

export default defineCard({
  name: "Confusticate and Bebother",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Counter target spell unless its controller pays {4}.\n• Draw two cards, then discard a card.",
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
      {
        text: "Draw two cards, then discard a card.",
        effect: {
          kind: "sequence",
          effects: [{ kind: "draw", amount: 2 }, { kind: "discard", target: "you", amount: 1 }],
        },
      },
    ],
  },
});
