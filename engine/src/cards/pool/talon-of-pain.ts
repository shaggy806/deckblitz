import { defineCard } from "../define.js";

// EDHREC rank 22063. "A source you control" is any source — a permanent or a
// spell — combat or noncombat damage alike; this artifact's own damage
// doesn't count (`otherOnly`).

const TRIGGER_TEXT =
  "Whenever a source you control other than this artifact deals damage to an opponent, put a charge counter on this artifact.";
const ACTIVATED_TEXT = "{X}, {T}, Remove X charge counters from this artifact: It deals X damage to any target.";

export default defineCard({
  name: "Talon of Pain",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${TRIGGER_TEXT}\n${ACTIVATED_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", otherOnly: true, to: "opponent" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: true, removeCounter: { kind: "charge", count: "x" } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
