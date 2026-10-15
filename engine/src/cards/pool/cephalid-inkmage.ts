import { defineCard } from "../define.js";

const THRESHOLD_TEXT =
  "Threshold — This creature can't be blocked as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Cephalid Inkmage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus", "Wizard"],
  power: 2,
  toughness: 2,
  text: `When this creature enters, surveil 3. (Look at the top three cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)\n${THRESHOLD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 3 },
      resolve: null,
      text: "When this creature enters, surveil 3.",
    },
  ],
  static: [
    {
      // Read as blockers are declared: reaching threshold after it's been
      // blocked doesn't unblock it (the ruling).
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantKeywords: ["unblockable"],
      text: THRESHOLD_TEXT,
    },
  ],
});
