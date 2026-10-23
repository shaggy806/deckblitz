import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 18951.
//
// Support 6 on a permanent (rule 701.41a): up to six *other* target
// creatures, any player's, one counter each. The life trigger is per
// creature, not per counter, and sees Gladehart itself die beside them.
const SUPPORT_TEXT =
  "When this creature enters, support 6. (Put a +1/+1 counter on each of up to six other target creatures.)";
const LIFE_TEXT = "Whenever a creature you control with a +1/+1 counter on it dies, you gain 2 life.";

export default defineCard({
  name: "Gladehart Cavalry",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Knight"],
  power: 6,
  toughness: 6,
  text: `${SUPPORT_TEXT}\n${LIFE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: distinctTargets(6, { kind: "other", of: "creature" }, { optional: true }),
      effect: {
        kind: "sequence",
        effects: [0, 1, 2, 3, 4, 5].map((target) => ({
          kind: "add-counter" as const,
          target,
          counter: "+1/+1",
          amount: 1,
        })),
      },
      resolve: null,
      text: SUPPORT_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
