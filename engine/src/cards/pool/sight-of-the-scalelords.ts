import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "At the beginning of combat on your turn, creatures you control with toughness 4 or greater get +2/+2 and gain vigilance until end of turn.";
const BIG = { type: "creature", controlledBy: "you", toughness: { op: "gte", n: 4 } } as const;

export default defineCard({
  name: "Sight of the Scalelords",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      // Both halves read the same set: the +2/+2 only goes to creatures
      // already at toughness 4 or more, which it leaves there, and none
      // below 4 is changed by it. Each set is locked as it resolves (rule
      // 611.2c).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: BIG, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: BIG, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
