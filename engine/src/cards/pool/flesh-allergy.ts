import { defineCard } from "../define.js";

// EDHREC rank 27754.
//
// The life loss counts every creature that died this turn, whoever controlled
// it — the sacrificed one and the destroyed target included — and happens
// even when the target survives (indestructible), but not when the spell
// fizzles for an illegal target (the rulings).

export default defineCard({
  name: "Flesh Allergy",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nDestroy target creature. Its controller loses life equal to the number of creatures that died this turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "lose-life", amount: { creaturesDiedThisTurn: true, anyController: true }, toControllerOfTarget: 0 },
    ],
  },
});
