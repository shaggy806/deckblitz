import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const COMBAT_TEXT = "At the beginning of combat on your turn, put a charge counter on this Equipment.";
const PT_TEXT = "Equipped creature gets +1/+1 for each counter on this Equipment.";
const STRIKE_TEXT = "As long as this Equipment has four or more counters on it, equipped creature has double strike.";

export default defineCard({
  name: "Gavel of the Righteous",
  manaCost: "{2}",
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${COMBAT_TEXT}\n${PT_TEXT}\n${STRIKE_TEXT}\nEquip—Pay {3} or remove a counter from this Equipment.`,
  static: [
    { affects: { scope: "attached" }, grantPtPerCount: { anyCountersOnSource: true, pt: [1, 1] }, text: PT_TEXT },
    {
      affects: { scope: "attached" },
      condition: { kind: "self-counters", compare: { op: "gte", n: 4 } },
      grantKeywords: ["double-strike"],
      text: STRIKE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  // One ability with a choice of two whole costs: an entry for each, which the
  // player picks by which they activate. Nothing tells that from one ability.
  activated: [
    equip("{3}"),
    {
      ...equip("{0}"),
      cost: { mana: null, tap: false, removeCounter: { kind: "any", count: 1 } },
      text: "Equip—Remove a counter from this Equipment",
    },
  ],
});
