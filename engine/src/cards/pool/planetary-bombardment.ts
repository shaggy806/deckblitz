import { defineCard } from "../define.js";

export default defineCard({
  name: "Planetary Bombardment",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Planetary Bombardment deals 2 damage to target creature. Planetary Bombardment deals 4 damage to that creature instead if a creature died this turn.",
  targets: ["creature"],
  effect: {
    kind: "damage",
    amount: { ifCondition: { kind: "creature-died-this-turn" }, then: 4, else: 2 },
    target: 0,
  },
});
