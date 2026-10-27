import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 27571.
//
// Rulings:
//   [2004-10-04] The creature’s controller gets the option to pay when this spell resolves.

export default defineCard({
  name: "Excise",
  manaCost: "{X}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target attacking creature unless its controller pays {X}.",
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
  // The target's controller is asked as this resolves (Clash of Wills' shape).
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payGeneric: "x", text: "Pay {X}." }],
    otherwise: { kind: "exile", target: 0 },
  },
});
