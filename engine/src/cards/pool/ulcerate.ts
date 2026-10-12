import { defineCard } from "../define.js";

export default defineCard({
  name: "Ulcerate",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -3/-3 until end of turn. You lose 3 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      { kind: "lose-life", amount: 3 },
    ],
  },
});
