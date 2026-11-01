import { defineCard } from "../define.js";

// The total is read as the spell is cast, when the division is announced
// (rule 601.2d) — "as you cast this spell" — and fixed from then on.
export default defineCard({
  name: "Undercity Upheaval",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Undergrowth — Distribute X +1/+1 counters among any number of target creatures you control, where X is the number of creature cards in your graveyard as you cast this spell. Creatures you control gain vigilance until end of turn.",
  targets: [{ kind: "any-number", of: "creature-you-control" }],
  divided: {
    total: { countInGraveyard: { type: "creature", ownedBy: "you" } },
    slot: 0,
    of: "+1/+1 counters",
  },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counters-divided", from: 0, counter: "+1/+1" },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "vigilance",
        duration: "end-of-turn",
      },
    ],
  },
});
