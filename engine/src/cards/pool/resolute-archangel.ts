import { defineCard } from "../define.js";

export default defineCard({
  name: "Resolute Archangel",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, if your life total is less than your starting life total, it becomes equal to your starting life total.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "life-total", atMost: { startingPlus: -1 } },
      targets: [],
      effect: { kind: "set-life-total", who: "you", amount: { startingLifeTotal: true } },
      resolve: null,
      text: "When this creature enters, if your life total is less than your starting life total, it becomes equal to your starting life total.",
    },
  ],
});
