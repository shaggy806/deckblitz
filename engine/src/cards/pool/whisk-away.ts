import { defineCard } from "../define.js";

export default defineCard({
  name: "Whisk Away",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Put target attacking or blocking creature on top of its owner's library.",
  targets: ["attacking-or-blocking-creature"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
