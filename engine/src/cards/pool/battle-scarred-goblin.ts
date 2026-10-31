import { defineCard } from "../define.js";

// Each creature blocking it as the trigger resolves, dealt 1
// by this creature (as it last existed, if it has left).
const BLOCKED_TEXT = "Whenever this creature becomes blocked, it deals 1 damage to each creature blocking it.";

export default defineCard({
  name: "Battle-Scarred Goblin",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 2,
  text: BLOCKED_TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "damage-all",
        amount: 1,
        filter: { type: "creature", blockingRelation: { relation: "blocking" } },
      },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
});
