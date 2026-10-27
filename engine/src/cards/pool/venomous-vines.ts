import { defineCard } from "../define.js";

export default defineCard({
  name: "Venomous Vines",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target enchanted permanent.",
  targets: [{ kind: "permanent", filter: { enchanted: true } }],
  effect: { kind: "destroy", target: 0 },
});
