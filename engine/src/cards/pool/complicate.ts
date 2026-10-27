import { defineCard } from "../define.js";

export default defineCard({
  name: "Complicate",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{2}{U}" },
  text: "Counter target spell unless its controller pays {3}.\nCycling {2}{U} ({2}{U}, Discard this card: Draw a card.)\nWhen you cycle this card, you may counter target spell unless its controller pays {1}.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{3}", text: "Pay {3}" }],
    otherwise: { kind: "counter", target: 0 },
  },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["spell"],
      effect: {
        kind: "may",
        prompt: "Counter target spell unless its controller pays {1}?",
        effect: {
          kind: "unless",
          chooser: 0,
          options: [{ pay: "{1}", text: "Pay {1}" }],
          otherwise: { kind: "counter", target: 0 },
        },
      },
      resolve: null,
      text: "When you cycle this card, you may counter target spell unless its controller pays {1}.",
    },
  ],
});
