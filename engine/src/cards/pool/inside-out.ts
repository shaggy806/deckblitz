import { defineCard } from "../define.js";


export default defineCard({
  name: "Inside Out",
  manaCost: "{1}{U/R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Switch target creature's power and toughness until end of turn.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "switch-pt", target: 0, duration: "end-of-turn" }, { kind: "draw", amount: 1 }],
  },
});
