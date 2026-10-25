import { defineCard } from "../define.js";

// #373 in top-commanders.txt.
//
// "Up to that many": the life you gained this turn as the ability goes on
// the stack — more gained in response changes nothing (the ruling) —
// divided among any number of other target creatures as it's put on the
// stack, at least one counter each (rule 603.3d), and fewer in all if you
// like. No targets at all is allowed, and puts on nothing (the ruling).
const END_TEXT =
  "At the beginning of each end step, if you gained life this turn, distribute up to that many +1/+1 counters among any number of other target creatures.";

export default defineCard({
  name: "Lathiel, the Bounteous Dawn",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Unicorn"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [{ kind: "any-number", of: { kind: "other", of: "creature" } }],
      divided: { total: 0, slot: 0, of: "+1/+1 counters", byTurnStat: "life-gained", upTo: true },
      effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
