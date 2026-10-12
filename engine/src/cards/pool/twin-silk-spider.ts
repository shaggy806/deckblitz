import { defineCard } from "../define.js";

export default defineCard({
  name: "Twin-Silk Spider",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 1,
  toughness: 2,
  keywords: ["reach"],
  text: "Reach\nWhen this creature enters, create a 1/2 green Spider creature token with reach.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "1/2 Green Spider Token (Reach)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/2 green Spider creature token with reach.",
    },
  ],
});
