import { defineCard } from "../define.js";

export default defineCard({
  name: "Quench",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {2}.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{2}", text: "Pay {2}" }],
    otherwise: { kind: "counter", target: 0 },
  },
});
