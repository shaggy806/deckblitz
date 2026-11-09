import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 21501. Overloaded, only the creatures you control as it resolves;
// each keeps its other card types (the rulings).
const shift = (target: number): EffectSpec => ({
  kind: "become",
  target,
  power: 4,
  toughness: 4,
  setSubtypes: ["Dragon"],
  setColors: ["U", "R"],
  loseAbilities: true,
  keywords: ["flying"],
  duration: "end-of-turn",
});

export default defineCard({
  name: "Dragonshift",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Until end of turn, target creature you control becomes a blue and red Dragon with base power and toughness 4/4, loses all abilities, and gains flying.\nOverload {3}{U}{U}{R}{R} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature-you-control"],
  effect: shift(0),
  overload: {
    cost: "{3}{U}{U}{R}{R}",
    effect: {
      kind: "for-each-permanent",
      filter: { type: "creature", controlledBy: "you" },
      simultaneous: true,
      effect: shift(0),
    },
  },
});
