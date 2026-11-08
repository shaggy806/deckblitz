import { defineCard } from "../define.js";

const PT_TEXT =
  "Dauntless Dourbark's power and toughness are each equal to the number of Forests you control plus the number of Treefolk you control.";
const TRAMPLE_TEXT = "This creature has trample as long as you control another Treefolk.";

// "Forests plus Treefolk": a permanent that's both is in each count, so the
// CDA (rule 604.3) is a `sum` of two counts, not one aggregate's union. A
// condition's count leaves the source out: "another Treefolk".
export default defineCard({
  name: "Dauntless Dourbark",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Warrior"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${TRAMPLE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: {
          sum: [{ countOf: { subtype: "Forest", controlledBy: "you" } }, { countOf: { subtype: "Treefolk", controlledBy: "you" } }],
        },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Treefolk" }, atLeast: 1 },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
});
