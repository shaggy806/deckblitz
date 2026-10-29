import { defineCard } from "../define.js";

export default defineCard({
  name: "Serene Sunset",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage X target creatures would deal this turn.",
  targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "damage-rule", by: { target: 0 }, combat: true },
  },
});
