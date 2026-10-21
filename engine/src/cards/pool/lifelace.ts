import { defineCard } from "../define.js";

// EDHREC rank 31757. For good: a spell keeps the colour while on the stack, and
// the permanent it becomes is a new object with its own (rule 400.7).

export default defineCard({
  name: "Lifelace",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target spell or permanent becomes green. (Mana symbols on that permanent remain unchanged.)",
  targets: [{ kind: "spell-or-permanent" }],
  effect: { kind: "become-color", target: 0, colors: ["G"], duration: "permanent" },
});
