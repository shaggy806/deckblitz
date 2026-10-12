import { defineCard } from "../define.js";

// EDHREC rank 10685.

export default defineCard({
  name: "Beyond the Quiet",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile all creatures and Spacecraft.",
  targets: [],
  // A Spacecraft is exiled whether or not it's stationed into a creature.
  effect: { kind: "exile-all", filter: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }] } },
});
