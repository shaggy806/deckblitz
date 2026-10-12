import { defineCard } from "../define.js";

export default defineCard({
  name: "Excavation Explosion",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Excavation Explosion deals 3 damage to any target. Create a tapped Powerstone token. (It's an artifact with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
    ],
  },
});
