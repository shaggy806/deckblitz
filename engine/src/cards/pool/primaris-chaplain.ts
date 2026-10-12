import { defineCard } from "../define.js";

export default defineCard({
  name: "Primaris Chaplain",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Astartes", "Cleric"],
  power: 3,
  toughness: 3,
  text: "Battle cry (Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn.)\nRosarius — Whenever this creature attacks, it gains indestructible until end of turn.",
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
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Rosarius — Whenever this creature attacks, it gains indestructible until end of turn.",
    },
  ],
});
