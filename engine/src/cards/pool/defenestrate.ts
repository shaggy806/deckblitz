import { defineCard } from "../define.js";

export default defineCard({
  name: "Defenestrate",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature without flying.",
  targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
  effect: { kind: "destroy", target: 0 },
});
