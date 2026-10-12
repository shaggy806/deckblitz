import { defineCard } from "../define.js";

export default defineCard({
  name: "Fallow Earth",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put target land on top of its owner's library.",
  targets: ["land"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
