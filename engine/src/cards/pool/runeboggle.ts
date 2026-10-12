import { defineCard } from "../define.js";

export default defineCard({
  name: "Runeboggle",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {1}.\nDraw a card.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
