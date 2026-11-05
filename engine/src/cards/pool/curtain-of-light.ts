import { defineCard } from "../define.js";

// EDHREC rank 22133.

export default defineCard({
  name: "Curtain of Light",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cast this spell only during combat after blockers are declared.\nTarget unblocked attacking creature becomes blocked. (This spell works on creatures that can't be blocked.)\nDraw a card.",
  targets: [{ kind: "permanent", filter: { unblocked: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "become-blocked", target: 0 }, { kind: "draw", amount: 1 }],
  },
  castOnlyIf: { kind: "turn-structure", steps: ["declare-blockers", "combat-damage", "end-combat"] },
});
