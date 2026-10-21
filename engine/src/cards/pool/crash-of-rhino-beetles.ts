import { defineCard } from "../define.js";

export default defineCard({
  name: "Crash of Rhino Beetles",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample\nThis creature gets +10/+10 as long as you control ten or more lands.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 10, countsSelf: true },
      grantPt: [10, 10],
      text: "This creature gets +10/+10 as long as you control ten or more lands.",
    },
  ],
});
