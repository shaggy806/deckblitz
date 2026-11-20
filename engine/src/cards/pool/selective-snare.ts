import { defineCard } from "../define.js";

// Exactly X targets, X announced first (rule 601.2b–c), all of the creature
// type chosen as it's cast (`oneCreatureType`): one that's no longer of that
// type as it resolves is an illegal target and stays (608.2b).
export default defineCard({
  name: "Selective Snare",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return X target creatures of the creature type of your choice to their owner's hand.",
  targets: [{ kind: "any-number", of: "creature", min: "x", max: "x", oneCreatureType: true }],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "return-to-hand", target: 0 },
  },
});
