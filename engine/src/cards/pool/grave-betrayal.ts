import { defineCard } from "../define.js";

// EDHREC rank 4826.
//
// Rulings:
//   [2013-01-24] Grave Betrayal doesn't overwrite any previous colors or types. Rather, it adds
//     another color and another creature type.
//   [2013-01-24] The phrase "with an additional +1/+1 counter on it" means that the creature
//     enters with one more +1/+1 counter than it would normally enter with. It doesn't keep any
//     counters it had on it when it died.
//   [2013-01-24] If a creature you don't control dies during the end step, that creature won't
//     return to the battlefield until the beginning of the next end step.
//   [2013-01-24] If the creature card leaves the graveyard before the delayed triggered ability
//     resolves, it won't return to the battlefield.
//   [2013-01-24] If the creature is normally colorless, it will simply be black.
//
// Each death sets up its own delayed trigger (rule 603.7), whose "it" is the
// card that died, found only while it's still that card in the graveyard
// (rule 400.7). It enters a black Zombie (`enterAs`) with the extra counter.
const TEXT =
  "Whenever a creature you don't control dies, return it to the battlefield under your control with an additional +1/+1 counter on it at the beginning of the next end step. That creature is a black Zombie in addition to its other colors and types.";

export default defineCard({
  name: "Grave Betrayal",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        text: "Return that creature to the battlefield under your control with an additional +1/+1 counter on it. It's a black Zombie in addition to its other colors and types.",
        effect: {
          kind: "put-onto-battlefield",
          target: "trigger-object",
          underYourControl: true,
          withCounters: { kind: "+1/+1", amount: 1 },
          enterAs: { addColors: ["B"], addSubtypes: ["Zombie"] },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
