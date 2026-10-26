import { defineCard } from "../define.js";

// EDHREC rank 16870.

export default defineCard({
  name: "Deglamer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose target artifact or enchantment. Its owner shuffles it into their library.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
  effect: { kind: "shuffle-into-library", target: 0 },
});
