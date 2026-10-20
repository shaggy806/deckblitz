import { defineCard } from "../define.js";

const KICKED_TEXT = "If this creature was kicked, it enters with two +1/+1 counters on it.";
const ATTACK_TEXT =
  "As long as this creature has a +1/+1 counter on it, it can attack as though it didn't have defender.";

export default defineCard({
  name: "Skyclave Sentinel",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "defender"],
  text: `Kicker {4} (You may pay an additional {4} as you cast this spell.)\nFlying, defender\n${KICKED_TEXT}\n${ATTACK_TEXT}`,
  kicker: { cost: "{4}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 } },
      },
      text: KICKED_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } },
      canAttackAsThoughNoDefender: true,
      text: ATTACK_TEXT,
    },
  ],
});
