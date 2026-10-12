import { defineCard } from "../define.js";

export default defineCard({
  name: "Kuldotha Ringleader",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Berserker"],
  power: 4,
  toughness: 4,
  text: "Battle cry (Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn.)\nThis creature attacks each combat if able.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Battle cry",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
