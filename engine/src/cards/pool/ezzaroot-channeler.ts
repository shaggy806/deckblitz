import { defineCard } from "../define.js";

// The reduction is generic only and counts life gained this
// turn regardless of life lost (the rulings) — the `life-gained` turn stat.
const REDUCE_TEXT =
  "Creature spells you cast cost {X} less to cast, where X is the amount of life you gained this turn.";

export default defineCard({
  name: "Ezzaroot Channeler",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Druid"],
  power: 4,
  toughness: 6,
  keywords: ["reach"],
  text: `Reach\n${REDUCE_TEXT}\n{T}: You gain 2 life.`,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { type: "creature" },
        caster: "you",
        reduceGeneric: { turnStat: "life-gained", who: "you" },
      },
      text: REDUCE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "{T}: You gain 2 life.",
    },
  ],
});
