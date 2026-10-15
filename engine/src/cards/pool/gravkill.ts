import { defineCard } from "../define.js";

// EDHREC rank 15475. Embrace Oblivion's target, exiling.

export default defineCard({
  name: "Gravkill",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target creature or Spacecraft.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }] } }],
  effect: { kind: "exile", target: 0 },
});
