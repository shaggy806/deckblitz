import { defineCard } from "../define.js";

// Portal. EDHREC rank 20358.
export default defineCard({
  name: "Boiling Seas",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy all Islands.",
  targets: [],
  effect: { kind: "destroy-all", filter: { subtype: "Island" } },
});
