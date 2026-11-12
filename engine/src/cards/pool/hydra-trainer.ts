import { defineCard } from "../define.js";

// EDHREC rank 12617. X is read as the reflexive ability resolves (the ruling).
const EXERT_TEXT =
  "You may exert this creature as it attacks. When you do, target creature gets +X/+X until end of turn, where X is the number of counters on permanents you control. (An exerted creature won't untap during your next untap step.)";
const ADAPT_TEXT = "{2}{G}: Adapt 2. (If this creature has no +1/+1 counters on it, put two +1/+1 counters on it.)";

const COUNTERS = { aggregate: "sum", of: "counters", filter: { controlledBy: "you" } } as const;

export default defineCard({
  name: "Hydra Trainer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  text: `${EXERT_TEXT}\n${ADAPT_TEXT}`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: "You may exert this creature as it attacks." }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: COUNTERS, toughness: COUNTERS, duration: "end-of-turn" },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "adapt", amount: 2 },
      resolve: null,
      text: ADAPT_TEXT,
    },
  ],
});
