import { defineCard } from "../define.js";

// EDHREC rank 27619.

export default defineCard({
  name: "Strip Bare",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy all Auras and Equipment attached to target creature.",
  targets: ["creature"],
  effect: { kind: "destroy-all", filter: { subtypes: ["Aura", "Equipment"], attachedToObject: 0 } },
});
