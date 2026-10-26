import { defineCard } from "../define.js";

export default defineCard({
  name: "Creeping Corrosion",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy all artifacts.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "artifact" } },
});
