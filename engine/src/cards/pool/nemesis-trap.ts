import { defineCard } from "../define.js";

// Worldwake (WWK). EDHREC rank 24764.
//
// "A white creature is attacking" is anyone's — yours or an opponent's —
// and once it's paid for {B}{B} any attacking creature may be the target
// (the rulings). The token copies the exiled creature as it last existed
// (its copiable values only), enters under your control, and is exiled at
// the next end step.
const ATTACKING_WHITE = { type: "creature", colors: ["W"], attacking: true } as const;

export default defineCard({
  name: "Nemesis Trap",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If a white creature is attacking, you may pay {B}{B} rather than pay this spell's mana cost.\nExile target attacking creature. Create a token that's a copy of that creature. Exile it at the beginning of the next end step.",
  alternativeCost: {
    mana: "{B}{B}",
    condition: {
      kind: "any",
      of: [
        { kind: "controls", filter: ATTACKING_WHITE, atLeast: 1 },
        { kind: "opponent-controls", filter: ATTACKING_WHITE, atLeast: 1 },
      ],
    },
  },
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token-copy", of: 0, count: 1, who: "you", exileAtEndStep: true },
    ],
  },
});
