import { defineCard } from "../define.js";

export default defineCard({
  name: "Sweep Away",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand. If that creature is attacking, you may put it on top of its owner's library instead.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { attacking: true } },
    then: {
      kind: "may",
      prompt: "Put that creature on top of its owner's library instead of returning it to their hand?",
      effect: { kind: "put-on-library", target: 0, position: "top" },
      else: { kind: "return-to-hand", target: 0 },
    },
    else: { kind: "return-to-hand", target: 0 },
  },
});
