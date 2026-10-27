import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 12658.
//
// Exactly X targets (Wake the Dead's `min`/`max: "x"`), returned together.
export default defineCard({
  name: "Distorting Wake",
  manaCost: "{X}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return X target nonland permanents to their owners' hands.",
  targets: [{ kind: "any-number", of: "nonland-permanent", min: "x", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "return-to-hand", target: 0 },
  },
});
