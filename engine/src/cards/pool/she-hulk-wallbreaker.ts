import { defineCard } from "../define.js";

// MSC. EDHREC rank 11468.
const OTHERS_TEXT = "Other Heroes you control have trample.";
const BLOCKED_TEXT =
  "Whenever a Hero you control becomes blocked, put a +1/+1 counter on that Hero for each creature blocking it.";

export default defineCard({
  name: "She-Hulk, Wallbreaker",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Gamma", "Hero"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${OTHERS_TEXT}\n${BLOCKED_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Hero" },
      grantKeywords: ["trample"],
      text: OTHERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "you-control", filter: { subtype: "Hero" } },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "trigger-object",
        counter: "+1/+1",
        amount: { blockersOf: "trigger-object" },
      },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
});
