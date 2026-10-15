import { defineCard } from "../define.js";

const MAYHEM_TEXT =
  "Mayhem {3}{B} (You may cast this card from your graveyard for {3}{B} if you discarded it this turn. Timing rules still apply.)";
const EFFECT_TEXT =
  "All creatures get -2/-2 until end of turn. If this spell's mayhem cost was paid, creatures your opponents control get -2/-2 until end of turn instead.";

export default defineCard({
  name: "Sandman's Quicksand",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  mayhem: { cost: "{3}{B}" },
  text: `${MAYHEM_TEXT}\n${EFFECT_TEXT}`,
  targets: [],
  effect: {
    // Mayhem is an alternative cost (rule 702.187b): cast for it, the spell's
    // `castVia` is "mayhem" — read off the resolving spell itself.
    kind: "conditional",
    condition: { kind: "source", filter: { castVia: "mayhem" } },
    then: {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "opponent" },
      power: -2,
      toughness: -2,
      duration: "end-of-turn",
    },
    else: { kind: "modify-pt-all", filter: { type: "creature" }, power: -2, toughness: -2, duration: "end-of-turn" },
  },
});
