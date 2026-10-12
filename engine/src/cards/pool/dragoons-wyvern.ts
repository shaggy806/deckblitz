import { defineCard } from "../define.js";

export default defineCard({
  name: "Dragoon's Wyvern",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, create a 1/1 colorless Hero creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Hero Token (Black Mage's Rod)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 colorless Hero creature token.",
    },
  ],
});
