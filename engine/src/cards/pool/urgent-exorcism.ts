import { defineCard } from "../define.js";

export default defineCard({
  name: "Urgent Exorcism",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target Spirit or enchantment.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ subtype: "Spirit" }, { type: "enchantment" }] } }],
  effect: { kind: "destroy", target: 0 },
});
