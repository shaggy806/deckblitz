import { defineCard } from "../define.js";

export default defineCard({
  name: "Magister Sphinx",
  manaCost: "{4}{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, target player's life total becomes 10.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "set-life-total", who: 0, amount: 10 },
      resolve: null,
      text: "When this creature enters, target player's life total becomes 10.",
    },
  ],
});
