import { defineCard } from "../define.js";

export default defineCard({
  name: "Wave of Indifference",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "X target creatures can't block this turn.",
  targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
  },
});
