import { defineCard } from "../define.js";

// EDHREC rank 18055. Marvel Super Heroes Commander.
//
// Abzan Falconer's counter-gated flying, narrowed to other Merfolk, and
// Luminarch Aspirant's combat trigger with connive in place of the counter.
const FLYING_TEXT = "Each other Merfolk you control with a +1/+1 counter on it has flying.";
const CONNIVE_TEXT =
  "At the beginning of combat on your turn, target creature you control connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)";

export default defineCard({
  name: "Namor, Scourge of the Seas",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Merfolk", "Villain"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${FLYING_TEXT}\n${CONNIVE_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { subtype: "Merfolk", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        excludeSelf: true,
      },
      grantKeywords: ["flying"],
      text: FLYING_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "connive", target: 0 },
      resolve: null,
      text: CONNIVE_TEXT,
    },
  ],
});
