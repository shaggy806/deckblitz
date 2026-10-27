import { defineCard } from "../define.js";

const TRIGGER_TEXT = "When this creature enters, it deals 3 damage to each creature without flying.";

export default defineCard({
  name: "Thunder Dragon",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 3 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
