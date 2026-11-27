import { defineCard } from "../define.js";

// EDHREC rank 25724. Any permanent, anyone's: the counter goes on whatever
// became tapped, and the replacement (`would-untap-in-untap-step`) works in
// each permanent's controller's own untap step, Freyalise's Winds' controller
// removing the counters. Beside a stun counter its controller chooses which
// applies (rule 616.1); either way it doesn't untap.

const TAP_TEXT = "Whenever a permanent becomes tapped, put a wind counter on it.";
const UNTAP_TEXT =
  "If a permanent with a wind counter on it would untap during its controller's untap step, remove all wind counters from it instead.";

export default defineCard({
  name: "Freyalise's Winds",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${TAP_TEXT}\n${UNTAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "any" },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "wind", amount: 1 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-untap-in-untap-step",
        filter: { counters: { kind: "wind", compare: { op: "gte", n: 1 } } },
        instead: { removeCounter: "wind", amount: "all" },
      },
      text: UNTAP_TEXT,
    },
  ],
});
