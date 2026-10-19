import { defineCard } from "../define.js";

// EDHREC rank 24425.
//
// Rulings:
//   [2022-09-09] If the target creature is an illegal target as Strength of the Coalition tries to
//     resolve, none of its effects will occur. You won't put a +1/+1 counter on any creatures,
//     even if it was kicked.
//   [2022-09-09] If the spell is kicked, the target creature will get both a +1/+1 counter and
//     +2/+2 until end of turn.

const PUMP = { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" } as const;

export default defineCard({
  name: "Strength of the Coalition",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Kicker {2}{W} (You may pay an additional {2}{W} as you cast this spell.)\nTarget creature you control gets +2/+2 until end of turn. If this spell was kicked, put a +1/+1 counter on each creature you control.",
  targets: ["creature-you-control"],
  effect: PUMP,
  kicker: {
    cost: "{2}{W}",
    effect: {
      kind: "sequence",
      effects: [
        PUMP,
        { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      ],
    },
  },
});
