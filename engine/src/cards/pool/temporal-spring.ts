import { defineCard } from "../define.js";

export default defineCard({
  name: "Temporal Spring",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: "Put target permanent on top of its owner's library.",
  targets: ["permanent"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
