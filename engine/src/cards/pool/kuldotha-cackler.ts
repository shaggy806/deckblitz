import { defineCard } from "../define.js";

// X is read as the trigger resolves: permanents of any type you control with
// at least one oil counter (the `counters` filter clause), itself included.

const ATTACK_TEXT =
  "Whenever this creature attacks, it gets +X/+0 until end of turn, where X is the number of permanents you control with oil counters on them.";

export default defineCard({
  name: "Kuldotha Cackler",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Hyena"],
  power: 2,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { controlledBy: "you", counters: { kind: "oil", compare: { op: "gte", n: 1 } } } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
