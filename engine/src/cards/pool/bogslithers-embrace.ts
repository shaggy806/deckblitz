import { defineCard } from "../define.js";

// A choice of additional costs (rule 601.2b): blighting is offered only with
// a creature to blight (701.68b), and which one is chosen as it's paid.
export default defineCard({
  name: "Bogslither's Embrace",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, blight 1 or pay {3}. (To blight 1, put a -1/-1 counter on a creature you control.)\nExile target creature.",
  additionalCost: {
    options: [
      { text: "Blight 1", blight: 1 },
      { text: "Pay {3}", mana: "{3}" },
    ],
  },
  targets: ["creature"],
  effect: { kind: "exile", target: 0 },
});
