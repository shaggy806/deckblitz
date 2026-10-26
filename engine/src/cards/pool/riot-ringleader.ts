import { defineCard } from "../define.js";

// EDHREC rank 28121.
const TEXT = "Whenever this creature attacks, Human creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Riot Ringleader",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Human", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
