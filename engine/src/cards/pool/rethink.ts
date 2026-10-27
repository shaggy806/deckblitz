import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 23282. Thassa's Rebuff's shape, X read as the
// targeted spell's mana value as this resolves.
//
// Rulings:
//   [2004-10-04] The spell's controller gets the option to pay when this spell resolves.

export default defineCard({
  name: "Rethink",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {X}, where X is its mana value.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payGeneric: { manaValueOf: 0 }, text: "Pay {X}, where X is its mana value." }],
    otherwise: { kind: "counter", target: 0 },
  },
});
