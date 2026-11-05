import { defineCard } from "../define.js";

// EDHREC rank 10486.
//
// The second ability's "if" is an intervening one, read as it would trigger and again as it
// resolves, from the Quest's last existence on the battlefield if it has left (the ruling).

const QUEST = "Whenever an opponent discards a card, you may put a quest counter on this enchantment.";
const UPKEEP =
  "At the beginning of each opponent's upkeep, if that player has no cards in hand and this enchantment has two or more quest counters on it, you may have that player lose 5 life.";

export default defineCard({
  name: "Quest for the Nihil Stone",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${QUEST}\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "discards", who: "opponent", perCard: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a quest counter on Quest for the Nihil Stone?",
        effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      },
      resolve: null,
      text: QUEST,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: {
        kind: "all",
        of: [
          { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atMost: 0 } },
          { kind: "self-counters", counter: "quest", compare: { op: "gte", n: 2 } },
        ],
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have that player lose 5 life?",
        effect: { kind: "lose-life", amount: 5, who: "active-player" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
