import { defineCard } from "../define.js";

// EDHREC rank 25474.
//
// "Put a +1/+1 counter on a creature you control" targets nothing: the
// creature is chosen as the spell resolves (Kayla's Command's shape), before
// the -2/-2 applies.

const SHRINK = {
  kind: "modify-pt-all",
  filter: { type: "creature" },
  power: -2,
  toughness: -2,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Choking Miasma",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Kicker {G} (You may pay an additional {G} as you cast this spell.)\nIf this spell was kicked, put a +1/+1 counter on a creature you control.\nAll creatures get -2/-2 until end of turn.",
  targets: [],
  effect: SHRINK,
  kicker: {
    cost: "{G}",
    effect: {
      kind: "sequence",
      effects: [
        {
          kind: "choose-permanents",
          filter: { type: "creature", controlledBy: "you" },
          min: 1,
          upTo: 1,
          prompt: "Choose a creature you control to put a +1/+1 counter on",
          then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        },
        SHRINK,
      ],
    },
  },
});
