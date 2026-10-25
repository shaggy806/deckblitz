import { defineCard } from "../define.js";

// The token copies the creature as it last existed on the battlefield (rule
// 608.2h), under the caster's control.
export default defineCard({
  name: "Supplant Form",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand. You create a token that's a copy of that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "create-token-copy", of: 0, count: 1, who: "you" },
    ],
  },
});
