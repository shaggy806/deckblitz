import { defineCard } from "../define.js";

// One slot over two zones (`one-of`), as Sorceress's Schemes: of the two
// returns only the one from the zone the target is in does anything.
export default defineCard({
  name: "Venser's Diffusion",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target nonland permanent or suspended card to its owner's hand.",
  targets: [{ kind: "one-of", of: ["nonland-permanent", { kind: "card-in-exile", filter: { suspended: true } }] }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 0, from: "exile" },
    ],
  },
});
