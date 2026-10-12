import { defineCard } from "../define.js";

export default defineCard({
  name: "Convolute",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {4}.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{4}", text: "Pay {4}" }],
    otherwise: { kind: "counter", target: 0 },
  },
});
