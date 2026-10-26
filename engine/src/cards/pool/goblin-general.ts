import { defineCard } from "../define.js";

// EDHREC rank 21970.

const TEXT = "Whenever this creature attacks, Goblin creatures you control get +1/+1 until end of turn.";

export default defineCard({
  name: "Goblin General",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Goblin", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
