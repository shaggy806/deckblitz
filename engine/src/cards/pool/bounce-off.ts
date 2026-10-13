import { defineCard } from "../define.js";

// EDHREC rank 9487.

export default defineCard({
  name: "Bounce Off",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature or Vehicle to its owner's hand.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  effect: { kind: "return-to-hand", target: 0 },
});
