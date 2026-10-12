import { defineCard } from "../define.js";

export default defineCard({
  name: "Rhox Veteran",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rhino", "Soldier"],
  power: 2,
  toughness: 4,
  text: "Battle cry (Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn.)\nWhenever this creature attacks, tap target creature an opponent controls.",
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
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "Whenever this creature attacks, tap target creature an opponent controls.",
    },
  ],
});
