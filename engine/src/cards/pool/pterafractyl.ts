import { defineCard } from "../define.js";

// EDHREC rank 16386. A 1/0: cast for X = 0 it dies to state-based actions,
// its enters trigger still gaining the life.
const ENTERS_TEXT = "When this creature enters, you gain 2 life.";

export default defineCard({
  name: "Pterafractyl",
  manaCost: "{X}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Fractal"],
  power: 1,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\nThis creature enters with X +1/+1 counters on it.\n${ENTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "This creature enters with X +1/+1 counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
