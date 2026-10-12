import { defineCard } from "../define.js";

export default defineCard({
  name: "Spell Snip",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Counter target spell unless its controller pays {1}.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{1}", text: "Pay {1}" }],
    otherwise: { kind: "counter", target: 0 },
  },
});
