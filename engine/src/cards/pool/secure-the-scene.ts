import { defineCard } from "../define.js";

// Reduce to Memory's shape. An illegal target by resolution: the spell
// doesn't resolve, and nobody gets a Soldier (its ruling).
export default defineCard({
  name: "Secure the Scene",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target nonland permanent. Its controller creates a 1/1 white Soldier creature token.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token", token: "Soldier Token", count: 1, who: "target-controller" },
    ],
  },
});
