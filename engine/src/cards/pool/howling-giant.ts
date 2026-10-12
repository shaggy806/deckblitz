import { defineCard } from "../define.js";

export default defineCard({
  name: "Howling Giant",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant", "Druid"],
  power: 5,
  toughness: 5,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\nWhen this creature enters, create two 2/2 green Wolf creature tokens.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 2/2 green Wolf creature tokens.",
    },
  ],
});
