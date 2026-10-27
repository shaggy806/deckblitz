import { defineCard } from "../define.js";

// EDHREC rank 14745.

export default defineCard({
  name: "Rites of Refusal",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Discard any number of cards. Counter target spell unless its controller pays {3} for each card discarded this way.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "you", amount: 0, anyNumber: true },
      {
        kind: "unless",
        chooser: 0,
        options: [{ payGeneric: { product: [3, { thisWay: "discarded" }] }, text: "Pay {X}" }],
        otherwise: { kind: "counter", target: 0 },
      },
    ],
  },
});
