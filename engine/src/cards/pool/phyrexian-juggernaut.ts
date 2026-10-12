import { defineCard } from "../define.js";

export default defineCard({
  name: "Phyrexian Juggernaut",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Juggernaut"],
  power: 5,
  toughness: 5,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\nThis creature attacks each combat if able.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
