import { defineCard } from "../define.js";

export default defineCard({
  name: "Inaction Injunction",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Detain target creature an opponent controls. (Until your next turn, that creature can't attack or block and its activated abilities can't be activated.)\nDraw a card.",
  targets: ["creature-an-opponent-controls"],
  effect: { kind: "sequence", effects: [{ kind: "detain", target: 0 }, { kind: "draw", amount: 1 }] },
});
