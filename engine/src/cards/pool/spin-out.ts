import { defineCard } from "../define.js";

// EDHREC rank 16379.

export default defineCard({
  name: "Spin Out",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature or Vehicle.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  effect: { kind: "destroy", target: 0 },
});
