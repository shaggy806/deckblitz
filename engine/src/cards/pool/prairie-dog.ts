import { defineCard } from "../define.js";

// EDHREC rank 23456.
//
// The end-step trigger's intervening "if" (rule 603.4) is checked as the step
// begins and again on resolution (the ruling), reading each spell as it was
// cast (`castFrom`). The activated ability makes a replacement effect lasting
// the turn (rule 614.1a, 611.2c), whatever becomes of the Dog; each
// resolution adds one more (the ruling), and a creature entering with +1/+1
// counters while it lasts enters with one more (the ruling, 122.6).
const END_STEP =
  "At the beginning of your end step, if you haven't cast a spell from your hand this turn, put a +1/+1 counter on this creature.";
const ADDEND =
  "{4}{W}: Until end of turn, if you would put one or more +1/+1 counters on a creature you control, put that many plus one +1/+1 counters on it instead.";

export default defineCard({
  name: "Prairie Dog",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Squirrel"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${END_STEP}\n${ADDEND}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      condition: { kind: "cast-this-turn", who: "you", filter: { castFrom: "hand" }, atLeast: 0, atMost: 0 },
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: END_STEP,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{W}", tap: false },
      targets: [],
      effect: {
        kind: "replacement-effect",
        replacement: {
          event: "would-add-counter",
          instead: { modify: { plus: 1 } },
          counterKind: "+1/+1",
          whoPuts: "you",
          filter: { type: "creature", controlledBy: "you" },
        },
        duration: "end-of-turn",
      },
      resolve: null,
      text: ADDEND,
    },
  ],
});
