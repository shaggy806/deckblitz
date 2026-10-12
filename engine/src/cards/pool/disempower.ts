import { defineCard } from "../define.js";

export default defineCard({
  name: "Disempower",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put target artifact or enchantment on top of its owner's library.",
  targets: ["artifact-or-enchantment"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
