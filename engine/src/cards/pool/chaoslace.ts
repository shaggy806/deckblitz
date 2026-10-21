import { defineCard } from "../define.js";

// EDHREC rank 30377. For good: a spell keeps the colour while on the stack, and
// the permanent it becomes is a new object with its own (rule 400.7).

export default defineCard({
  name: "Chaoslace",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target spell or permanent becomes red. (Its mana symbols remain unchanged.)",
  targets: [{ kind: "spell-or-permanent" }],
  effect: { kind: "become-color", target: 0, colors: ["R"], duration: "permanent" },
});
