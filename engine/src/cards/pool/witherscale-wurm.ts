import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Shadowmoor (SHM). EDHREC rank 20436.
//
// Rulings:
//   The second ability triggers on any damage dealt to an opponent, not just combat damage.
//   The first ability does not give Witherscale Wurm wither.

const WITHER_TEXT =
  "Whenever this creature blocks or becomes blocked by a creature, that creature gains wither until end of turn.";
const GAINS_WITHER: EffectSpec = {
  kind: "grant-keyword",
  target: "trigger-object",
  keyword: "wither",
  duration: "end-of-turn",
};

export default defineCard({
  name: "Witherscale Wurm",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 9,
  toughness: 9,
  text: "Whenever this creature blocks or becomes blocked by a creature, that creature gains wither until end of turn. (It deals damage to creatures in the form of -1/-1 counters.)\nWhenever this creature deals damage to an opponent, remove all -1/-1 counters from it.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: GAINS_WITHER,
      resolve: null,
      text: WITHER_TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: GAINS_WITHER,
      resolve: null,
      text: WITHER_TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: {
        kind: "remove-counter",
        target: "source",
        counter: "-1/-1",
        amount: { countersOn: "source", counter: "-1/-1" },
      },
      resolve: null,
      text: "Whenever this creature deals damage to an opponent, remove all -1/-1 counters from it.",
    },
  ],
});
