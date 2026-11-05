import { ATTACKED_OR_BLOCKED_THIS_COMBAT } from "../helpers.js";
import { defineCard } from "../define.js";

const COMBAT_TEXT = "At end of combat, if this creature attacked or blocked this combat, remove a +1/+0 counter from it.";
const WIND_TEXT =
  "{X}, {T}: Put up to X +1/+0 counters on this creature. This ability can't cause the total number of +1/+0 counters on this creature to be greater than four. Activate only during your upkeep.";

export default defineCard({
  name: "Clockwork Avian",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Bird"],
  power: 0,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\nThis creature enters with four +1/+0 counters on it.\n${COMBAT_TEXT}\n${WIND_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+0", amount: 4 } },
      text: "This creature enters with four +1/+0 counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end-combat", who: "any" },
      condition: ATTACKED_OR_BLOCKED_THIS_COMBAT,
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "+1/+0", amount: 1 },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [],
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      effect: {
        kind: "choose-value",
        value: "number",
        max: { leastOf: ["x", { sum: [4, { product: [{ countersOn: "source", counter: "+1/+0" }, -1] }] }] },
        then: { kind: "add-counter", target: "source", counter: "+1/+0", amount: "x" },
      },
      resolve: null,
      text: WIND_TEXT,
    },
  ],
});
