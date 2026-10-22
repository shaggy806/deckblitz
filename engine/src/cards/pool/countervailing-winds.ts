import { defineCard } from "../define.js";

// The graveyard is counted as the spell resolves, while Countervailing Winds is
// still on the stack (its ruling): `payGeneric` is read as the effect applies.
const COUNTER_TEXT = "Counter target spell unless its controller pays {1} for each card in your graveyard.";

export default defineCard({
  name: "Countervailing Winds",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: `${COUNTER_TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payGeneric: { graveyardSize: "you" }, text: "Pay {X}." }],
    otherwise: { kind: "counter", target: 0 },
  },
});
