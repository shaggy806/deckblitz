import { defineCard } from "../define.js";

// EDHREC rank 10552. Adaptive Snapjaw's evolve, and Mindless Automaton's
// counter-removal cost on a self-regeneration.

const EVOLVE_TEXT =
  "Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)";
const REGEN_TEXT = "Remove two +1/+1 counters from this creature: Regenerate it.";

const BIGGER = {
  type: "creature",
  anyOf: [
    { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
    { toughness: { op: "gt", n: { amount: { toughnessOf: "source" } } } },
  ],
} as const;

export default defineCard({
  name: "Experiment One",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Ooze"],
  power: 1,
  toughness: 1,
  text: `${EVOLVE_TEXT}\n${REGEN_TEXT} (The next time this creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)`,
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: 2 } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: BIGGER },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: BIGGER },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: EVOLVE_TEXT,
    },
  ],
});
