import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 7125. They keep their abilities (the ruling); overloaded, only
// the creatures you control as it resolves.
const wurm = (target: number): EffectSpec => ({
  kind: "become",
  target,
  power: 6,
  toughness: 4,
  setSubtypes: ["Wurm"],
  setColors: ["G"],
  duration: "end-of-turn",
});

export default defineCard({
  name: "Scale Up",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Until end of turn, target creature you control becomes a green Wurm with base power and toughness 6/4.\nOverload {4}{G}{G} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature-you-control"],
  effect: wurm(0),
  overload: {
    cost: "{4}{G}{G}",
    effect: {
      kind: "for-each-permanent",
      filter: { type: "creature", controlledBy: "you" },
      simultaneous: true,
      effect: wurm(0),
    },
  },
});
