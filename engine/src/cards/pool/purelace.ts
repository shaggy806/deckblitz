import { defineCard } from "../define.js";

// EDHREC rank 30936. For good: a spell keeps the colour while on the stack, and
// the permanent it becomes is a new object with its own (rule 400.7).

export default defineCard({
  name: "Purelace",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target spell or permanent becomes white. (Mana symbols on that permanent remain unchanged.)",
  targets: [{ kind: "spell-or-permanent" }],
  effect: { kind: "become-color", target: 0, colors: ["W"], duration: "permanent" },
});
