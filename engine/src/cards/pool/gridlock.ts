import { defineCard } from "../define.js";

// EDHREC rank 15547.

export default defineCard({
  name: "Gridlock",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap X target nonland permanents.",
  targets: [{ kind: "any-number", of: "nonland-permanent", min: "x", max: "x" }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
});
