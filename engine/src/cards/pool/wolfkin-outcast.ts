import { defineCard } from "../define.js";

// Rulings:
//   Wolfkin Outcast costs {2} less to cast if you control a Wolf or Werewolf even if it's
//   currently night.

export default defineCard({
  name: "Wolfkin Outcast",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 5,
  toughness: 4,
  keywords: ["daybound"],
  text: "This spell costs {2} less to cast if you control a Wolf or Werewolf.\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtypes: ["Wolf", "Werewolf"] }, atLeast: 1 },
    reduceGeneric: 2,
  },
  faces: ["Wolfkin Outcast", "Wedding Crasher"],
  transform: true,
});
