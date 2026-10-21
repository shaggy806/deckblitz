import { defineCard } from "../define.js";

// EDHREC rank 21152. Adapt 3 may always be activated; it adds nothing while
// any +1/+1 counter is on it, and adapts again once they're all gone (the
// rulings).
const ADAPT_TEXT =
  "{6}{G/U}{G/U}: Adapt 3. (If this creature has no +1/+1 counters on it, put three +1/+1 counters on it.)";
const ATTACK_TEXT =
  "As long as this creature has a +1/+1 counter on it, it can attack as though it didn't have defender.";

export default defineCard({
  name: "Scuttlegator",
  manaCost: "{4}{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Crab", "Turtle", "Crocodile"],
  power: 6,
  toughness: 6,
  keywords: ["defender"],
  text: `Defender\n${ADAPT_TEXT}\n${ATTACK_TEXT}`,
  activated: [
    {
      cost: { mana: "{6}{G/U}{G/U}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 },
      },
      resolve: null,
      text: ADAPT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } },
      canAttackAsThoughNoDefender: true,
      text: ATTACK_TEXT,
    },
  ],
});
