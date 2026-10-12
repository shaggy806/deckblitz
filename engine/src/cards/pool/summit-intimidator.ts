import { defineCard } from "../define.js";

export default defineCard({
  name: "Summit Intimidator",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Yeti"],
  power: 4,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach\nWhen this creature enters, target creature can't block this turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "When this creature enters, target creature can't block this turn.",
    },
  ],
});
