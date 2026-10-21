import { defineCard } from "../define.js";

export default defineCard({
  name: "Mystic Repeal",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put target enchantment on the bottom of its owner's library.",
  targets: [{ kind: "permanent", filter: { type: "enchantment" } }],
  effect: { kind: "put-on-bottom-of-library", target: 0 },
});
