import { defineCard } from "../define.js";

// EDHREC rank 30762.

export default defineCard({
  name: "Soul Nova",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target attacking creature and all Equipment attached to it.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "exile-all", filter: { subtype: "Equipment", attachedToObject: 0 } },
      { kind: "exile", target: 0 },
    ],
  },
});
