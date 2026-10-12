import { defineCard } from "../define.js";

export default defineCard({
  name: "Loxodon Restorer",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Cleric"],
  power: 3,
  toughness: 4,
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nWhen this creature enters, you gain 4 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: "When this creature enters, you gain 4 life.",
    },
  ],
});
