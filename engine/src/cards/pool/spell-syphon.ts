import { defineCard } from "../define.js";

export default defineCard({
  name: "Spell Syphon",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {1} for each blue permanent you control.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payGeneric: { countOf: { colors: ["U"], controlledBy: "you" } }, text: "Pay {X}." }],
    otherwise: { kind: "counter", target: 0 },
  },
});
