import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 29144.
//
// The top-or-bottom choice is made on resolution (the ruling), and only for a
// creature that's red then.

export default defineCard({
  name: "Ether Well",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Put target creature on top of its owner's library. If that creature is red, you may put it on the bottom of its owner's library instead.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { colors: ["R"] } },
    then: {
      kind: "may",
      prompt: "Put it on the bottom of its owner's library instead of the top?",
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      else: { kind: "put-on-library", target: 0, position: "top" },
    },
    else: { kind: "put-on-library", target: 0, position: "top" },
  },
});
