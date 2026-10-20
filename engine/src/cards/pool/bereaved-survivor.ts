import { defineCard } from "../define.js";

export default defineCard({
  name: "Bereaved Survivor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 2,
  toughness: 1,
  text: "When another creature you control dies, transform this creature.",
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "When another creature you control dies, transform this creature.",
    },
  ],
  faces: ["Bereaved Survivor", "Dauntless Avenger"],
  transform: true,
});
