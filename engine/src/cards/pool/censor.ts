import { defineCard } from "../define.js";

export default defineCard({
  name: "Censor",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{U}" },
  text: "Counter target spell unless its controller pays {1}.\nCycling {U} ({U}, Discard this card: Draw a card.)",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{1}", text: "Pay {1}" }],
    otherwise: { kind: "counter", target: 0 },
  },
});
