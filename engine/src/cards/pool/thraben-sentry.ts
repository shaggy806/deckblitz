import { defineCard } from "../define.js";

export default defineCard({
  name: "Thraben Sentry",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance\nWhenever another creature you control dies, you may transform this creature.",
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "may", prompt: "Transform Thraben Sentry?", effect: { kind: "transform", target: "source" } },
      resolve: null,
      text: "Whenever another creature you control dies, you may transform this creature.",
    },
  ],
  faces: ["Thraben Sentry", "Thraben Militia"],
  transform: true,
});
