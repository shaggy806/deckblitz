import { defineCard } from "../define.js";

// EDHREC rank 14315.
//
// Rulings:
//   [2004-10-04] Aurification gives the creature type "Wall" to creatures with gold counters on
//     them in addition to granting them defender.
//
// "It" is the creature that dealt the damage (Dread's trigger object). The
// last line takes every gold counter off every creature at once
// (`remove-counter-all`, rule 122).
const DAMAGE_TEXT = "Whenever a creature deals damage to you, put a gold counter on it.";
const WALL_TEXT =
  "Each creature with a gold counter on it is a Wall in addition to its other creature types and has defender. (Those creatures can't attack.)";
const LEAVE_TEXT = "When this enchantment leaves the battlefield, remove all gold counters from all creatures.";

export default defineCard({
  name: "Aurification",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${DAMAGE_TEXT}\n${WALL_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", filter: { type: "creature" }, to: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "gold", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "remove-counter-all", filter: { type: "creature" }, counter: "gold", amount: "all" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", counters: { kind: "gold", compare: { op: "gte", n: 1 } } } },
      addSubtypes: ["Wall"],
      grantKeywords: ["defender"],
      text: WALL_TEXT,
    },
  ],
});
