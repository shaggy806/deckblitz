import { defineCard } from "../define.js";

const COUNTERS_TEXT = "This enchantment enters with X isolation counters on it.";
const ENTER_TEXT =
  "When this enchantment enters, for each isolation counter on it, exile up to one target nonland permanent an opponent controls until this enchantment leaves the battlefield.";

// The isolation counters are counted as the trigger goes on the stack, fixing
// how many targets it may have (the ruling); later counter changes don't
// matter. Everything exiled returns together when it leaves.
export default defineCard({
  name: "Quarantine Field",
  manaCost: "{X}{X}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${COUNTERS_TEXT}\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "isolation", amount: "x" } },
      text: COUNTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: "nonland-permanent-an-opponent-controls",
          max: { countersOn: "source", counter: "isolation" },
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
