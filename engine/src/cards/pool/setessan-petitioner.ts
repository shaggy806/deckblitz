import { defineCard } from "../define.js";

// Devotion is counted as the trigger resolves, the Petitioner itself
// included if it's still there (the rulings).
const ENTER_TEXT =
  "When this creature enters, you gain life equal to your devotion to green. (Each {G} in the mana costs of permanents you control counts toward your devotion to green.)";

export default defineCard({
  name: "Setessan Petitioner",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { devotionTo: "G" } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
