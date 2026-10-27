import { defineCard } from "../define.js";

export default defineCard({
  name: "Churning Eddy",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return target creature and target land to their owners' hands.",
  targets: ["creature", "land"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
    ],
  },
});
