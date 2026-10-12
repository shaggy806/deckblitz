import { defineCard } from "../define.js";

export default defineCard({
  name: "Goblin Shortcutter",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Scout"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, target creature can't block this turn.",
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
