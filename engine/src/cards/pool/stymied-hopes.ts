import { defineCard } from "../define.js";

export default defineCard({
  name: "Stymied Hopes",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {1}. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
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
      { kind: "scry", amount: 1 },
    ],
  },
});
