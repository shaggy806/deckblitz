import { defineCard } from "../define.js";

const QUEST_TEXT =
  "Whenever a card is put into your graveyard from anywhere, you may put a quest counter on this enchantment.";
const SAC_TEXT =
  "Remove five quest counters from this enchantment and sacrifice it: Target player shuffles their graveyard into their library.";

export default defineCard({
  name: "Quest for Ancient Secrets",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${QUEST_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a quest counter on Quest for Ancient Secrets?",
        effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      },
      resolve: null,
      text: QUEST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "quest", count: 5 }, sacrifice: "self" },
      targets: ["player"],
      effect: { kind: "shuffle-graveyard-into-library", target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
