import { defineCard } from "../define.js";

// EDHREC rank 26341.
//
// The discard follows whichever way the payment went (the ruling); a spell
// countered is read as it last was on the stack, so "that player" is still its
// controller.
export default defineCard({
  name: "Frightful Delusion",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {1}. That player discards a card.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "unless", chooser: 0, options: [{ pay: "{1}", text: "Pay {1}" }], otherwise: { kind: "counter", target: 0 } },
      { kind: "discard", target: { controllerOfTarget: 0 }, amount: 1 },
    ],
  },
});
