import { defineCard } from "../define.js";

// The two creatures may have the same controller (the ruling).
export default defineCard({
  name: "Blood Feud",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target creature fights another target creature. (Each deals damage equal to its power to the other.)",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: { kind: "fight", a: 0, b: 1 },
});
