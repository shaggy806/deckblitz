import { defineCard } from "../define.js";

const BODY_THIEF = "Body Thief — When you cast this spell, you may exile a creature you control and put a takeover counter on it.";

// Any creature card in exile with a takeover counter will do, whoever's it is
// and whichever Master put it there.
export default defineCard({
  name: "The Master, Formed Anew",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Time Lord", "Rogue"],
  power: 0,
  toughness: 1,
  text: `${BODY_THIEF}\nYou may have The Master enter as a copy of a creature card in exile with a takeover counter on it.`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        upTo: 1,
        then: { kind: "exile", target: 0, withCounters: { kind: "takeover", amount: 1 } },
        prompt: "You may exile a creature you control and put a takeover counter on it",
      },
      resolve: null,
      text: BODY_THIEF,
    },
  ],
  copyOnEnter: {
    filter: { type: "creature", counters: { kind: "takeover", compare: { op: "gte", n: 1 } } },
    from: "exile",
  },
});
