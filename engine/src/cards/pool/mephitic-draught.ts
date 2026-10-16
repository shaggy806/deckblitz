import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 8446.
//
// Ichor Wellspring's pair of triggers, each drawing a card and losing 1 life.
const TEXT =
  "When this artifact enters or is put into a graveyard from the battlefield, you draw a card and you lose 1 life.";
const EFFECT: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "draw", amount: 1 },
    { kind: "lose-life", amount: 1 },
  ],
};

export default defineCard({
  name: "Mephitic Draught",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
