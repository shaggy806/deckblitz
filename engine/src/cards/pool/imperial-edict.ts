import { defineCard } from "../define.js";

// Only the opponent is targeted; the creature is chosen as the spell
// resolves, so a hexproof creature can be chosen and destroyed.

export default defineCard({
  name: "Imperial Edict",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent chooses a creature they control. Destroy that creature.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        who: { target: 0 },
        for: { permanent: { type: "creature", controlledBy: "you" }, own: true },
      },
      { kind: "for-each-voted", which: "voted", effect: { kind: "destroy", target: 0 } },
    ],
  },
});
