import { defineCard } from "../define.js";

export default defineCard({
  name: "Select for Inspection",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target tapped creature to its owner's hand. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "return-to-hand", target: 0 }, { kind: "scry", amount: 1 }],
  },
});
