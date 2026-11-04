import { defineCard } from "../define.js";

export default defineCard({
  name: "False Orders",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "Cast this spell only during the declare blockers step.\n" +
    "Remove target creature defending player controls from combat. Creatures it was blocking that had become blocked by only that creature this combat become unblocked. You may have it block an attacking creature of your choice.",
  castOnlyIf: { kind: "turn-structure", steps: ["declare-blockers"] },
  targets: [{ kind: "permanent", filter: { type: "creature", controlledByDefendingPlayer: true } }],
  effect: { kind: "remove-from-combat", target: 0, unblockSoleBlocked: true, thenMayBlock: true },
});
