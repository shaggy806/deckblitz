import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 18521. The artifacts are counted as it
// resolves, from Override's controller's side (Protect the Negotiators'
// shape).

export default defineCard({
  name: "Override",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {1} for each artifact you control.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [
      {
        payGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
        text: "Pay {X}, where X is the number of artifacts Override's controller controls.",
      },
    ],
    otherwise: { kind: "counter", target: 0 },
  },
});
