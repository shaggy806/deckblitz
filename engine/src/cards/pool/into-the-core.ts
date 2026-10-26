import { defineCard } from "../define.js";

// EDHREC rank 24260. Dust to Dust's shape: two different targets (the
// ruling), exiled as one event.
export default defineCard({
  name: "Into the Core",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
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
