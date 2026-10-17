import { defineCard } from "../define.js";

export default defineCard({
  name: "Wibbly-wobbly, Timey-wimey",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Time travel. (For each suspended card you own and each permanent you control with a time counter on it, you may add or remove a time counter.)\nDraw a card.",
  effect: { kind: "sequence", effects: [{ kind: "time-travel" }, { kind: "draw", amount: 1 }] },
});
