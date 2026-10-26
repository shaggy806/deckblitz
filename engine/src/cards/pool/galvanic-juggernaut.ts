import { defineCard } from "../define.js";

// EDHREC rank 24869.

export default defineCard({
  name: "Galvanic Juggernaut",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Juggernaut"],
  power: 5,
  toughness: 5,
  text: "This creature attacks each combat if able.\nThis creature doesn't untap during your untap step.\nWhenever another creature dies, untap this creature.",
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "Whenever another creature dies, untap this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
    {
      affects: { scope: "self" },
      doesntUntap: true,
      text: "This creature doesn't untap during your untap step.",
    },
  ],
});
