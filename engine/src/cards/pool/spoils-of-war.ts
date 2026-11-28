import { defineCard } from "../define.js";

// X is defined by the text (rule 107.3c), read from the side of the opponent
// the caster names as it's cast (`xIs.ofAnOpponent`): offered once per X an
// opponent's graveyard gives, and fixed from then on (the ruling: exactly
// that many, not "up to"). The division is announced as it's cast (601.2d).
const TEXT =
  "X is the number of artifact and/or creature cards in an opponent's graveyard as you cast this spell.\nDistribute X +1/+1 counters among any number of target creatures.";

export default defineCard({
  name: "Spoils of War",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  xIs: {
    amount: { countInGraveyard: { anyOf: [{ type: "artifact" }, { type: "creature" }], ownedBy: "you" } },
    ofAnOpponent: true,
  },
  targets: [{ kind: "any-number", of: "creature" }],
  divided: { total: "x", slot: 0, of: "+1/+1 counters" },
  effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
});
