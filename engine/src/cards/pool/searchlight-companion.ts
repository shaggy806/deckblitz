import { defineCard } from "../define.js";

export default defineCard({
  name: "Searchlight Companion",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Drone"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, create a 1/1 colorless Spirit creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Colorless)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 colorless Spirit creature token.",
    },
  ],
});
