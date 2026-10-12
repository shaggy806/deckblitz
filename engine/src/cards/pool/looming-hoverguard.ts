import { defineCard } from "../define.js";

export default defineCard({
  name: "Looming Hoverguard",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drone"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, put target artifact on top of its owner's library.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["artifact"],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: "When this creature enters, put target artifact on top of its owner's library.",
    },
  ],
});
