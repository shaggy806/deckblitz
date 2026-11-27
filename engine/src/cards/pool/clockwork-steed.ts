import { ATTACKED_OR_BLOCKED_THIS_COMBAT } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 24366.
//
// Rulings:
//   Can attack or block even if it has no counters.
//   Loses a counter even if it is affected by a Fog-like effect which
//     prevents it from dealing damage.
//   When Clockwork Steed's last ability resolves, you can choose to put fewer
//     than X +1/+0 counters on it.
//   If Clockwork Steed has four or fewer +1/+0 counters on it when its last
//     ability resolves, it can wind up with a maximum of four such counters
//     on it. If it has four or more +1/+0 counters on it, the ability will
//     have no effect.
//
// "Up to X" is a number chosen up to what keeps it at four; `upToTotal`
// holds it there after a replacement (Doubling Season) too.

const ENTER = "This creature enters with four +1/+0 counters on it.";
const UNBLOCKABLE = "This creature can't be blocked by artifact creatures.";
const COMBAT = "At end of combat, if this creature attacked or blocked this combat, remove a +1/+0 counter from it.";
const WIND =
  "{X}, {T}: Put up to X +1/+0 counters on this creature. This ability can't cause the total number of +1/+0 counters on this creature to be greater than four. Activate only during your upkeep.";

export default defineCard({
  name: "Clockwork Steed",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Horse"],
  power: 0,
  toughness: 3,
  text: `${ENTER}\n${UNBLOCKABLE}\n${COMBAT}\n${WIND}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+0", amount: 4 } },
      text: ENTER,
    },
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", by: { type: "artifact" } }],
      text: UNBLOCKABLE,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end-combat", who: "any" },
      condition: ATTACKED_OR_BLOCKED_THIS_COMBAT,
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "+1/+0", amount: 1 },
      resolve: null,
      text: COMBAT,
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
        then: { kind: "add-counter", target: "source", counter: "+1/+0", amount: "x", upToTotal: 4 },
      },
      resolve: null,
      text: WIND,
    },
  ],
});
