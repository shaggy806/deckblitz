import { defineCard } from "../define.js";

// EDHREC rank 7531.
const QUEST_TEXT = "Whenever a Goblin you control enters, you may put a quest counter on this enchantment.";
const ANTHEM_TEXT =
  "As long as this enchantment has five or more quest counters on it, creatures you control get +2/+0.";

export default defineCard({
  name: "Quest for the Goblin Lord",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${QUEST_TEXT}\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Goblin" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a quest counter on Quest for the Goblin Lord?",
        effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      },
      resolve: null,
      text: QUEST_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "self-counters", counter: "quest", compare: { op: "gte", n: 5 } },
      grantPt: [2, 0],
      text: ANTHEM_TEXT,
    },
  ],
});
