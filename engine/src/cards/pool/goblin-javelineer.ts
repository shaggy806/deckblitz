import { defineCard } from "../define.js";

// The target is a creature blocking it as the trigger goes on
// the stack and again as it resolves (rule 608.2b) — `blockingRelation`
// against this creature, read as it last was if it has left.
const BLOCKED_TEXT = "Whenever this creature becomes blocked, it deals 1 damage to target creature blocking it.";

export default defineCard({
  name: "Goblin Javelineer",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${BLOCKED_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "blocking" } } }],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
});
