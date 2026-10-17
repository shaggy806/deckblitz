import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

// EDHREC rank 8889.
//
// The "if" is an intervening if (rule 603.4), read again as it resolves; the
// counter moves from this artifact onto the planeswalker that entered (rule
// 122.5), still the same object.
const MOVE_TEXT =
  "Whenever a planeswalker you control enters, if this artifact has loyalty counters on it, you may move a loyalty counter from this artifact onto that planeswalker.";

export default defineCard({
  name: "Gatewatch Beacon",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `This artifact enters with three loyalty counters on it.\n{T}: Add {W}.\n${MOVE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "loyalty", amount: 3 } },
      text: "This artifact enters with three loyalty counters on it.",
    },
  ],
  activated: [manaTapAbility("W")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "planeswalker" } },
      condition: { kind: "self-counters", counter: "loyalty", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Move a loyalty counter from Gatewatch Beacon onto that planeswalker?",
        effect: { kind: "move-counters", from: "source", to: "trigger-object", counter: "loyalty", amount: 1 },
      },
      resolve: null,
      text: MOVE_TEXT,
    },
  ],
});
