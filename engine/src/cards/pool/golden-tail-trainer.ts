import { defineCard } from "../define.js";

// The reduction is locked in as the cost is worked out (the rulings); the
// attack pump reads this creature's power as it resolves. "Modified" is rule
// 700.9: a counter, an Equipment, or an Aura its controller controls.

const REDUCE_TEXT = "Aura and Equipment spells you cast cost {X} less to cast, where X is this creature's power.";
const ATTACK_TEXT =
  "Whenever this creature attacks, other modified creatures you control get +X/+X until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Golden-Tail Trainer",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Fox", "Samurai"],
  power: 1,
  toughness: 3,
  text: `${REDUCE_TEXT}\n${ATTACK_TEXT} (Equipment, Auras you control, and counters are modifications.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you", modified: true },
        power: { powerOf: "source" },
        toughness: { powerOf: "source" },
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { subtypes: ["Aura", "Equipment"] },
        reduceGeneric: { powerOf: "source" },
        when: { caster: "you" },
      },
      text: REDUCE_TEXT,
    },
  ],
});
