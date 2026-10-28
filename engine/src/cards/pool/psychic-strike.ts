import { defineCard } from "../define.js";

// Gatecrash (GTC). EDHREC rank 9192. Countermand's shape: the mill reads the
// targeted spell's controller from the slot.

export default defineCard({
  name: "Psychic Strike",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Counter target spell. Its controller mills two cards.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "mill", target: 0, amount: 2 },
    ],
  },
});
