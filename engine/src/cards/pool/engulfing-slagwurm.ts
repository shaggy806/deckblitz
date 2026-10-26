import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 10342. Once for each creature it blocks or becomes blocked by
// (the ruling), as Flameheart Werewolf's two halves of one ability. The life
// is that creature's toughness as it is, or as it last existed on the
// battlefield once destroyed (the ruling) — and is gained even if it
// regenerated or had already left.
const TEXT =
  "Whenever this creature blocks or becomes blocked by a creature, destroy that creature. You gain life equal to that creature's toughness.";

const EFFECT: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "destroy", target: "trigger-object" },
    { kind: "gain-life", amount: { toughnessOf: "trigger-object" } },
  ],
};

export default defineCard({
  name: "Engulfing Slagwurm",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 7,
  toughness: 7,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
