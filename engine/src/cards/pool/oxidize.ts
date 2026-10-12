import { defineCard } from "../define.js";

export default defineCard({
  name: "Oxidize",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target artifact. It can't be regenerated.",
  targets: ["artifact"],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
