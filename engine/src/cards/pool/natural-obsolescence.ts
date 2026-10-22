import { defineCard } from "../define.js";

export default defineCard({
  name: "Natural Obsolescence",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put target artifact on the bottom of its owner's library.",
  targets: ["artifact"],
  effect: { kind: "put-on-bottom-of-library", target: 0 },
});
