import { defineCard } from "../define.js";

export default defineCard({
  name: "Ghost-Lit Warder",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: "{3}{U}, {T}: Counter target spell unless its controller pays {2}.\nChannel — {3}{U}, Discard this card: Counter target spell unless its controller pays {4}.",
  activated: [
    {
      cost: { mana: "{3}{U}", tap: true },
      targets: ["spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: "{3}{U}, {T}: Counter target spell unless its controller pays {2}.",
    },
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: ["spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{4}", text: "Pay {4}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: "Channel — {3}{U}, Discard this card: Counter target spell unless its controller pays {4}.",
      zone: "hand",
    },
  ],
});
