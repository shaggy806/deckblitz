import { defineCard } from "../define.js";

// EDHREC rank 21532.

export default defineCard({
  name: "Soulscour",
  manaCost: "{7}{W}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all nonartifact permanents.",
  effect: { kind: "destroy-all", filter: { notTypes: ["artifact"] } },
});
