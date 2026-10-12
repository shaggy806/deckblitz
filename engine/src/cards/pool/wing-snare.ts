import { defineCard } from "../define.js";

export default defineCard({
  name: "Wing Snare",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target creature with flying.",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: { kind: "destroy", target: 0 },
});
