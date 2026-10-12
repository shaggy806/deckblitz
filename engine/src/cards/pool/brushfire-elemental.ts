import { defineCard } from "../define.js";

export default defineCard({
  name: "Brushfire Elemental",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nThis creature can't be blocked by creatures with power 2 or less.\nLandfall — Whenever a land you control enters, this creature gets +2/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, this creature gets +2/+2 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
});
