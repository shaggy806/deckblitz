import { defineCard } from "../define.js";

// EDHREC rank 25461.

const END_TEXT =
  "At the beginning of your end step, if you didn't cast a spell this turn, put two +1/+1 counters on Edgar.";
const PUMP_TEXT = "{4}{G}: Put a +1/+1 counter on each creature you control with a +1/+1 counter on it.";

// The intervening "if" is Nightpack Ambusher's: asked as the step begins and
// again as the ability resolves (rule 603.4).
export default defineCard({
  name: "Edgar, Moonlit Sovereign",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Werewolf", "Noble"],
  power: 4,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${END_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "not", of: { kind: "cast-this-turn" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{G}", tap: false },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
