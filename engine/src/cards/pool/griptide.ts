import { defineCard } from "../define.js";

export default defineCard({
  name: "Griptide",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Put target creature on top of its owner's library.",
  targets: ["creature"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
