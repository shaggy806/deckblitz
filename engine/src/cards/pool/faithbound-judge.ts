import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, if this creature has two or fewer judgment counters on it, put a judgment counter on it.";
const ATTACK_TEXT =
  "As long as this creature has three or more judgment counters on it, it can attack as though it didn't have defender.";

export default defineCard({
  name: "Faithbound Judge",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 4,
  toughness: 4,
  keywords: ["defender", "flying", "vigilance"],
  text: `Defender, flying, vigilance\n${UPKEEP_TEXT}\n${ATTACK_TEXT}\nDisturb {5}{W}{W} (You may cast this card from your graveyard transformed for its disturb cost.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "self-counters", counter: "judgment", compare: { op: "lte", n: 2 } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "judgment", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { counters: { kind: "judgment", compare: { op: "gte", n: 3 } } } },
      canAttackAsThoughNoDefender: true,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Faithbound Judge", "Sinner's Judgment"],
  transform: true,
  disturb: { cost: "{5}{W}{W}" },
});
