import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] If one target is removed or becomes invalid after declaration, the other target
//     is still affected.
export default defineCard({
  name: "Dust to Dust",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile two target artifacts.",
  targets: ["artifact", { kind: "other", of: "artifact", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "exile", target: 0 },
      { kind: "exile", target: 1 },
    ],
  },
});
