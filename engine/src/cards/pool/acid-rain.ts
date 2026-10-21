import { defineCard } from "../define.js";

// Legends. EDHREC rank 20938.
export default defineCard({
  name: "Acid Rain",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Destroy all Forests.",
  effect: { kind: "destroy-all", filter: { subtype: "Forest" } },
});
