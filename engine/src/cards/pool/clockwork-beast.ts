import { ATTACKED_OR_BLOCKED_THIS_COMBAT } from "../helpers.js";
import { defineCard } from "../define.js";

// X is paid in full; how many go on is chosen as it resolves, up to X and up to
// the room there is then, so one that already has seven takes none.
const COMBAT_TEXT = "At end of combat, if this creature attacked or blocked this combat, remove a +1/+0 counter from it.";
const WIND_TEXT =
  "{X}, {T}: Put up to X +1/+0 counters on this creature. This ability can't cause the total number of +1/+0 counters on this creature to be greater than seven. Activate only during your upkeep.";

export default defineCard({
  name: "Clockwork Beast",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Beast"],
  power: 0,
  toughness: 4,
  text: `This creature enters with seven +1/+0 counters on it.\n${COMBAT_TEXT}\n${WIND_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+0", amount: 7 } },
      text: "This creature enters with seven +1/+0 counters on it.",
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
        max: { leastOf: ["x", { sum: [7, { product: [{ countersOn: "source", counter: "+1/+0" }, -1] }] }] },
        then: { kind: "add-counter", target: "source", counter: "+1/+0", amount: "x" },
      },
      resolve: null,
      text: WIND_TEXT,
    },
  ],
});
