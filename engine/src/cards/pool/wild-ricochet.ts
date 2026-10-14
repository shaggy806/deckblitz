import { defineCard } from "../define.js";

// New targets for the spell first (rule 115.7d), then the copy — which copies
// the spell with the targets it has now, and may have new ones of its own.
export default defineCard({
  name: "Wild Ricochet",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "You may choose new targets for target instant or sorcery spell. Then copy that spell. You may choose new targets for the copy.",
  targets: ["instant-or-sorcery-spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "change-targets", target: 0, how: "choose-new" },
      { kind: "copy-spell", target: 0, newTargets: true },
    ],
  },
});
