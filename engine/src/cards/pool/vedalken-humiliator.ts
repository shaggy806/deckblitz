import { defineCard } from "../define.js";

const TEXT =
  "Metalcraft — Whenever this creature attacks, if you control three or more artifacts, creatures your opponents control lose all abilities and have base power and toughness 1/1 until end of turn.";

export default defineCard({
  name: "Vedalken Humiliator",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "metalcraft" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-abilities-all", filter: { type: "creature", controlledBy: "opponent" }, duration: "end-of-turn" },
          {
            kind: "animate-all",
            filter: { type: "creature", controlledBy: "opponent" },
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
