import { defineCard } from "../define.js";

const DIES_TEXT = "Whenever a creature dies, you may put a quest counter on this enchantment.";
const SAC_TEXT =
  "Remove three quest counters from this enchantment and sacrifice it: Create a 5/5 black Zombie Giant creature token.";

export default defineCard({
  name: "Quest for the Gravelord",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${DIES_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      // Any creature, whoever controlled it (its ruling).
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a quest counter on Quest for the Gravelord?",
        effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "quest", count: 3 }, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Giant Token", count: 1 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
