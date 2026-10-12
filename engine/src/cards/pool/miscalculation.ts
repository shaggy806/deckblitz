import { defineCard } from "../define.js";

export default defineCard({
  name: "Miscalculation",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Counter target spell unless its controller pays {2}.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{2}", text: "Pay {2}" }],
    otherwise: { kind: "counter", target: 0 },
  },
});
