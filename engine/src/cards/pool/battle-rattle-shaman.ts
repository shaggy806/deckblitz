import { defineCard } from "../define.js";

const TEXT = "At the beginning of combat on your turn, you may have target creature get +2/+0 until end of turn.";

export default defineCard({
  name: "Battle-Rattle Shaman",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature get +2/+0 until end of turn?",
        effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
