import { defineCard } from "../define.js";

export default defineCard({
  name: "Brood Weaver",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: "Reach\nWhen this creature dies, create a 1/2 green Spider creature token with reach.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "1/2 Green Spider Token (Reach)", count: 1 },
      resolve: null,
      text: "When this creature dies, create a 1/2 green Spider creature token with reach.",
    },
  ],
});
