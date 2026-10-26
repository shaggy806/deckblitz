import { defineCard } from "../define.js";

// EDHREC rank 26179. The colour is read as the spell resolves.

export default defineCard({
  name: "Consign to Dream",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target permanent to its owner's hand. If that permanent is red or green, put it on top of its owner's library instead.",
  targets: ["permanent"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { anyOf: [{ colors: ["R"] }, { colors: ["G"] }] } },
    then: { kind: "put-on-library", target: 0, position: "top" },
    else: { kind: "return-to-hand", target: 0 },
  },
});
