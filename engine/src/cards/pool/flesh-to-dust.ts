import { defineCard } from "../define.js";

export default defineCard({
  name: "Flesh to Dust",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature. It can't be regenerated.",
  targets: ["creature"],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
