import { defineCard } from "../define.js";

const SURVEIL_TEXT = "Whenever you surveil, put a +1/+1 counter on this creature.";
const ATTACK_TEXT =
  "As long as this creature has three or more +1/+1 counters on it, it can attack as though it didn't have defender.";

export default defineCard({
  name: "Thoughtbound Phantasm",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["defender"],
  text: `Defender\n${SURVEIL_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "surveils", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { counters: { kind: "+1/+1", compare: { op: "gte", n: 3 } } } },
      canAttackAsThoughNoDefender: true,
      text: ATTACK_TEXT,
    },
  ],
});
