import { defineCard } from "../define.js";

export default defineCard({
  name: "Clear a Path",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target creature with defender.",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "defender" } }],
  effect: { kind: "destroy", target: 0 },
});
