import { defineCard } from "../define.js";

export default defineCard({
  name: "Dreamspoiler Witches",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever you cast a spell during an opponent's turn, you may have target creature get -1/-1 until end of turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature get -1/-1 until end of turn?",
        effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      },
      resolve: null,
      text: "Whenever you cast a spell during an opponent's turn, you may have target creature get -1/-1 until end of turn.",
    },
  ],
});
