import { defineCard } from "../define.js";

// "Another Hero": a Hero other than this creature, which may target itself
// (it's a Hero too) and then gets one counter. Asked as the trigger resolves
// (608.2c, the instead read then); `isSource: false` is "other than its
// source".
const TEXT =
  "When this creature enters, put a +1/+1 counter on target creature. If that creature is another Hero, put two +1/+1 counters on it instead.";

export default defineCard({
  name: "Wakandan Royal Guard",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Hero", isSource: false } },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
        else: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
