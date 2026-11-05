import { defineCard } from "../define.js";

// EDHREC rank 526.

export default defineCard({
  name: "Gitaxian Probe",
  manaCost: "{U/P}",
  colors: ["U"],
  types: ["sorcery"],
  text: "({U/P} can be paid with either {U} or 2 life.)\nLook at target player's hand.\nDraw a card.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "look-at-hand", target: 0 }, { kind: "draw", amount: 1 }],
  },
});
