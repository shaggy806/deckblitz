import { defineCard } from "../define.js";

export default defineCard({
  name: "Forced Retreat",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Put target creature on top of its owner's library.",
  targets: ["creature"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
