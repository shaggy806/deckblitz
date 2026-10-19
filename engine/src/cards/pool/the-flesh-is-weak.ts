import { defineCard } from "../define.js";

// EDHREC rank 15831.
//
// Rulings:
//   [2022-10-07] If The Flesh Is Weak enters the battlefield while you control a nonartifact
//     creature with 1 toughness and no +1/+1 counters on it, the last ability will cause its
//     toughness to become 0 and it will die before the first ability can put a counter on it.
//   [2022-10-07] The same happens if a nonartifact creature you control with no +1/+1 counters on
//     it has damage marked on it equal to its toughness minus 1.
//
// The artifact type is added in layer 4, which every other static's scope
// reads, so a creature with a +1/+1 counter escapes the -1/-1 in layer 7c.
// Both statics apply from the moment it enters, before the enters trigger
// resolves (the rulings).

const ENTER_TEXT = "When this enchantment enters, put a +1/+1 counter on each creature you control.";
const ARTIFACT_TEXT = "Creatures you control with +1/+1 counters on them are artifacts in addition to their other types.";
const SHRINK_TEXT = "Nonartifact creatures get -1/-1.";

export default defineCard({
  name: "The Flesh Is Weak",
  manaCost: "{2}{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${ARTIFACT_TEXT}\n${SHRINK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      addTypes: ["artifact"],
      text: ARTIFACT_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", notTypes: ["artifact"] } },
      grantPt: [-1, -1],
      text: SHRINK_TEXT,
    },
  ],
});
