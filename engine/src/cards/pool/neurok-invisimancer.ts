import { defineCard } from "../define.js";

export default defineCard({
  name: "Neurok Invisimancer",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: "This creature can't be blocked.\nWhen this creature enters, target creature can't be blocked this turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, target creature can't be blocked this turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
});
