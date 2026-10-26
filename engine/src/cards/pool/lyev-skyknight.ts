import { defineCard } from "../define.js";

export default defineCard({
  name: "Lyev Skyknight",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, detain target nonland permanent an opponent controls. (Until your next turn, that permanent can't attack or block and its activated abilities can't be activated.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "detain", target: 0 },
      resolve: null,
      text: "When this creature enters, detain target nonland permanent an opponent controls.",
    },
  ],
});
