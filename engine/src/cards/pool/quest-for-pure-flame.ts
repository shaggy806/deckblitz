import { defineCard } from "../define.js";

const QUEST = "Whenever a source you control deals damage to an opponent, you may put a quest counter on this enchantment.";
const BLOW = "Remove four quest counters from this enchantment and sacrifice it: If any source you control would deal damage to a permanent or player this turn, it deals double that damage to that permanent or player instead.";

export default defineCard({
  name: "Quest for Pure Flame",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${QUEST}\n${BLOW}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", to: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a quest counter on Quest for Pure Flame?",
        effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      },
      resolve: null,
      text: QUEST,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "quest", count: 4 }, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "replacement-effect",
        duration: "end-of-turn",
        replacement: { event: "would-deal-damage", source: { controlledBy: "you" }, instead: { modify: { times: 2 } } },
      },
      resolve: null,
      text: BLOW,
    },
  ],
});
