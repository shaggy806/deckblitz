import { defineCard } from "../define.js";

// EDHREC rank 30002.

const TEXT = "When this creature dies, you may have target creature get -2/-2 until end of turn.";

export default defineCard({
  name: "Undead Executioner",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature get -2/-2 until end of turn?",
        effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
