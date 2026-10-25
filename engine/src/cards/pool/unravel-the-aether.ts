import { defineCard } from "../define.js";

// EDHREC rank 15703.

export default defineCard({
  name: "Unravel the Aether",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose target artifact or enchantment. Its owner shuffles it into their library.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
  effect: { kind: "shuffle-into-library", target: 0 },
});
